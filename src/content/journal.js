export const journalPosts = [
  {
    slug: 'new-on-the-shelf',
    date: '2026-11-02',
    title: {
      en: 'New on the shelf this month',
      mn: 'Энэ сарын шинэ ном',
    },
    excerpt: {
      en: 'Four volumes joined the archive this month, from a salt-river novel to a quiet comedy about a garden wall.',
      mn: 'Энэ сард архивт дөрвөн ном нэмэгдлээ: давсны голын тухай романаас цэцэрлэгийн хашааны тухай нам гүм хошин шог хүртэл.',
    },
    body: {
      en: [
        'Each volume enters the archive only after its spine and cover have been catalogued and given a permanent call number. This month brings together four distinct voices across three decades: River of Salt (ML-1964-03), The Green Road (ML-1969-05), The Long Tide (ML-1981-10), and A Quiet War (ML-1985-11).',
        'Whether you begin with two brothers hauling a salt barge downriver or thirty years of polite silence over a stone boundary wall, every volume is ready to be pulled from the shelf and reserved for reading.',
      ],
      mn: [
        'Ном бүр нуруу, хавтасны бүртгэл хийгдэж, байнгын лавлах дугаар авсны дараа л архивт ордог. Энэ сард гурван арван жилийг хамарсан дөрвөн өөр дуу хоолой нэг дор нэмэгдлээ: Давсны гол (ML-1964-03), Ногоон зам (ML-1969-05), Урт түрлэг (ML-1981-10), Нам гүм дайн (ML-1985-11).',
        'Гол даган давстай завь чирэх хоёр ах дүүгийн түүхээс эхлэх үү, эсвэл чулуун хашааны төлөө гучин жил үргэлжилсэн чимээгүй зөрчлөөс эхлэх үү — аль нь ч тавиураас аваад уншихад бэлэн байна.',
      ],
    },
  },
  {
    slug: 'reading-by-decade-1970s',
    date: '2026-10-18',
    title: {
      en: 'Reading by decade: the 1970s',
      mn: 'Арван жилээр унших нь: 1970-аад он',
    },
    excerpt: {
      en: 'A rider in a white desert, a night watchman, a town without birdsong: three books from one restless decade.',
      mn: 'Цагаан цөлийн морьтон, шөнийн манаач, шувуугүй хот: тайван бус нэг арван жилийн гурван ном.',
    },
    body: {
      en: [
        'Placed side by side on the 1970s stretch of the shelf, Noon in Ashes (1971), The Observer (1973), and The Fallen Birds (1975) share an atmosphere of quiet vigilance. Each protagonist is waiting for an answer that arrived long before they noticed it.',
        'Switch to the flat shelf and select the 1970s tab to move straight through this group, or trace their exact publication years along the bottom timeline on the main archive view.',
      ],
      mn: [
        '1970-аад оны тавиур дээр зэрэгцэн орших Үнсэн үд (1971), Ажиглагч (1973), Унасан шувууд (1975) нь нам гүм сэрэмжийн уур амьсгалаар холбогддог. Дүр бүр өөрөө анзаарахаас хамаагүй өмнө ирчихсэн хариултыг хүлээн сууна.',
        'Тавиурын харагдац руу орж 1970-аад оны хэсгийг сонгон эдгээр номоор аялах эсвэл үндсэн архивын доод цагийн шугамаас хэвлэгдсэн оныг нь дагаж үзээрэй.',
      ],
    },
  },
  {
    slug: 'how-to-reserve-a-book',
    date: '2026-09-27',
    title: {
      en: 'How to reserve a book',
      mn: 'Номыг хэрхэн захиалах вэ',
    },
    excerpt: {
      en: 'Open any book on the shelf, press reserve, and leave your details. We will confirm by email.',
      mn: 'Тавиур дээрх дурын номыг нээгээд захиалах товчийг дарж, мэдээллээ үлдээнэ үү. Бид имэйлээр баталгаажуулна.',
    },
    body: {
      en: [
        'Every book in mlibrary can be inspected in full from either the curved timeline or the flat shelf. Click the turned-out cover—or press Enter while browsing—to open its detail sheet, read the synopsis, and check its call number.',
        'Pressing Reserve this book takes you directly to our contact form with that volume preselected. Leave your name, email address, and preferred reading note, and our archive team will reply with availability.',
      ],
      mn: [
        'mlibrary дахь ном бүрийг муруй цагийн шугам эсвэл тэгш тавиураас дэлгэрэнгүй үзэх боломжтой. Нүүр хавтсыг нь дарах эсвэл Enter товчоор дэлгэрэнгүй хуудсыг нээж, товч агуулга болон лавлах дугаарыг нь шалгаарай.',
        'Номыг захиалах товчийг дармагц тухайн ном сонгогдсон холбоо барих маягт руу шууд шилжинэ. Нэр, имэйл болон хүсэлтээ үлдээхэд манай архивын баг бэлэн байдлыг имэйлээр баталгаажуулна.',
      ],
    },
  },
];

export function getJournalPost(slug) {
  return journalPosts.find((post) => post.slug === slug) || null;
}
