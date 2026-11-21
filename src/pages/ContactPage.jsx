import '../styles/tailwind.css';
import './contact.css';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import {
  CONTACT_LIMITS,
  TOPICS,
  makeContactSchema,
} from '../../functions/validation/contactRules.js';
import { books, getBookById } from '../content/books.js';
import { useLocale } from '../i18n/useLocale.js';
import { Button } from '../components/ui/button.jsx';
import { Checkbox } from '../components/ui/checkbox.jsx';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form.jsx';
import { Input } from '../components/ui/input.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.jsx';
import { Textarea } from '../components/ui/textarea.jsx';

function generateUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function ContactPage() {
  const { locale, t } = useLocale();
  const [searchParams] = useSearchParams();
  const requestIdRef = useRef(generateUuid());
  const bookCollapseRef = useRef(null);
  const successRef = useRef(null);
  const prevLocaleRef = useRef(locale);

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const initialTopicParam = searchParams.get('topic');
  const initialBookParam = searchParams.get('book');
  const initialTopic = TOPICS.includes(initialTopicParam) ? initialTopicParam : 'general';
  const initialBook =
    initialTopic === 'reserve' && initialBookParam && getBookById(initialBookParam)
      ? initialBookParam
      : '';

  useEffect(() => {
    document.title = t.meta.contactTitle;
  }, [t.meta.contactTitle]);

  const formSchema = useMemo(
    () => makeContactSchema(t.contact.validation),
    [t.contact.validation]
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      topic: initialTopic,
      bookId: initialBook,
      message: '',
      consent: false,
      website: '',
    },
  });

  const selectedTopic = form.watch('topic');
  const isReserve = selectedTopic === 'reserve';

  useEffect(() => {
    if (TOPICS.includes(initialTopicParam)) {
      form.setValue('topic', initialTopicParam, { shouldValidate: false });
      if (initialTopicParam !== 'reserve') {
        form.setValue('bookId', '', { shouldValidate: false });
        form.clearErrors('bookId');
      }
    }
    if (initialTopicParam === 'reserve' && initialBookParam && getBookById(initialBookParam)) {
      form.setValue('bookId', initialBookParam, { shouldValidate: false });
    }
  }, [initialTopicParam, initialBookParam, form]);

  useEffect(() => {
    const el = bookCollapseRef.current;
    if (el) {
      el.inert = !isReserve;
    }
  }, [isReserve]);

  useEffect(() => {
    if (prevLocaleRef.current === locale) return;
    prevLocaleRef.current = locale;
    const erroredFields = Object.keys(form.formState.errors);
    if (erroredFields.length > 0) {
      form.trigger(erroredFields);
    }
  }, [locale, formSchema, form]);

  useEffect(() => {
    if (submitSuccess && successRef.current) {
      successRef.current.focus();
    }
  }, [submitSuccess]);

  const onSubmit = async (values) => {
    setSubmitError('');

    const payload = {
      requestId: requestIdRef.current,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone || '',
      topic: values.topic,
      bookId: values.topic === 'reserve' ? values.bookId || '' : '',
      message: values.message,
      consent: values.consent,
      website: values.website || '',
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) {
        setSubmitError(t.contact.error);
      } else {
        requestIdRef.current = generateUuid();
        form.reset({
          fullName: '',
          email: '',
          phone: '',
          topic: values.topic,
          bookId: values.topic === 'reserve' ? values.bookId || '' : '',
          message: '',
          consent: false,
          website: '',
        });
        setSubmitSuccess(true);
      }
    } catch {
      setSubmitError(t.contact.error);
    }
  };

  return (
    <section>
      <p className="lbl page-eyebrow">{t.contact.eyebrow}</p>
      <div className="heading-mask is-rising">
        <h1 className="page-heading">{t.contact.heading}</h1>
      </div>
      <p className="prose-body">{t.contact.intro}</p>

      {submitSuccess ? (
        <div
          ref={successRef}
          role="status"
          tabIndex={-1}
          className="contact-success"
        >
          {t.contact.success}
        </div>
      ) : (
        <Form {...form}>
          <form
            className="contact-form"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.contact.name}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="name"
                      maxLength={CONTACT_LIMITS.nameMax}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.contact.email}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      maxLength={CONTACT_LIMITS.emailMax}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.contact.phone}</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      autoComplete="tel"
                      maxLength={CONTACT_LIMITS.phoneMax}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="contact-topic-group">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.contact.topic}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        if (val !== 'reserve') {
                          form.setValue('bookId', '', { shouldValidate: false });
                          form.clearErrors('bookId');
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger ref={field.ref}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TOPICS.map((key) => (
                          <SelectItem key={key} value={key}>
                            {t.contact.topics[key]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div
                ref={bookCollapseRef}
                className={`contact-book-collapse${isReserve ? ' is-open' : ''}`}
                aria-hidden={!isReserve}
              >
                <div className="contact-book-inner">
                  <div className="contact-book-spacer">
                    <FormField
                      control={form.control}
                      name="bookId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.contact.book}</FormLabel>
                          <Select
                            value={field.value || ''}
                            onValueChange={field.onChange}
                            disabled={!isReserve}
                          >
                            <FormControl>
                              <SelectTrigger ref={field.ref}>
                                <SelectValue placeholder={t.contact.selectBook} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {books.map((book) => (
                                <SelectItem key={book.id} value={book.id}>
                                  {`${book.title[locale] || book.title.en} (${book.callNo})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.contact.message}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      maxLength={CONTACT_LIMITS.messageMax}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="contact-honeypot" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...form.register('website')}
              />
            </div>

            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem>
                  <div className="contact-consent-row">
                    <FormControl>
                      <Checkbox
                        ref={field.ref}
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    </FormControl>
                    <FormLabel className="contact-consent-label">
                      {t.contact.consent}
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="contact-submit-wrap">
              {submitError && (
                <p role="alert" className="contact-alert">
                  {submitError}
                </p>
              )}
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? t.contact.sending : t.contact.send}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </section>
  );
}
