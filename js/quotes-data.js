/* ===========================================================
   Quote data — the single source of truth
   -----------------------------------------------------------
   Both the Quotes page and the hero block on the home page read
   from this array. Adding a quote here makes it appear in both
   places, so there is never a second list to keep in sync.

   Fields:
     en     the original English line
     zh     Chinese translation (shown on the quotes page)
     author who said it
     tag    one-word theme, used as a small label
     src    optional: work it comes from
   =========================================================== */

var QUOTES = [
  {
    en: 'The only thing necessary for the triumph of evil is for good men to do nothing.',
    zh: '恶得逞所需的唯一条件，就是好人袖手旁观。',
    author: 'Edmund Burke',
    tag: 'Complicity'
  },
  {
    en: 'The unexamined life is not worth living.',
    zh: '未经审视的人生，不值得一过。',
    author: 'Socrates',
    tag: 'Self-knowledge'
  },
  {
    en: 'Freedom is not worth having if it does not include the freedom to make mistakes.',
    zh: '倘若不包含犯错的自由，自由便毫无价值。',
    author: 'Mahatma Gandhi',
    tag: 'Freedom'
  },
  {
    en: 'Those who cannot remember the past are condemned to repeat it.',
    zh: '忘记历史的人，注定重蹈覆辙。',
    author: 'George Santayana',
    tag: 'Memory'
  },
  {
    en: 'Injustice anywhere is a threat to justice everywhere.',
    zh: '任何一处的不公，都是对所有地方正义的威胁。',
    author: 'Martin Luther King Jr.',
    tag: 'Justice'
  },
  {
    en: 'It is better to die on your feet than to live on your knees.',
    zh: '站着死，胜于跪着生。',
    author: 'Emiliano Zapata',
    tag: 'Dignity'
  },
  {
    en: 'The greatest glory in living lies not in never falling, but in rising every time we fall.',
    zh: '生命最大的荣耀不在于永不跌倒，而在于每次跌倒后都能站起。',
    author: 'Nelson Mandela',
    tag: 'Resilience'
  },
  {
    en: 'All that we see or seem is but a dream within a dream.',
    zh: '我们所见、所感的一切，不过是梦中之梦。',
    author: 'Edgar Allan Poe',
    tag: 'Reality'
  },
  {
    en: 'If you are neutral in situations of injustice, you have chosen the side of the oppressor.',
    zh: '在不公面前保持中立，你就已经选择站在压迫者一边。',
    author: 'Desmond Tutu',
    tag: 'Complicity'
  },
  {
    en: 'A person who never made a mistake never tried anything new.',
    zh: '从不犯错的人，从未尝试过任何新事物。',
    author: 'Albert Einstein',
    tag: 'Curiosity'
  },
  {
    en: 'The world is full of magic things, patiently waiting for our senses to grow sharper.',
    zh: '世间遍布奇妙之物，耐心等待我们的感知变得敏锐。',
    author: 'W. B. Yeats',
    tag: 'Wonder'
  },
  {
    en: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    zh: '我们由反复的行动塑造。卓越不是一次举动，而是一种习惯。',
    author: 'Aristotle',
    tag: 'Habit'
  },
  {
    en: 'Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that.',
    zh: '黑暗无法驱散黑暗，唯有光明可以；仇恨无法消解仇恨，唯有爱可以。',
    author: 'Martin Luther King Jr.',
    tag: 'Love'
  },
  {
    en: 'The price of greatness is responsibility.',
    zh: '伟大的代价，是责任。',
    author: 'Winston Churchill',
    tag: 'Responsibility'
  },
  {
    en: 'You have within you right now, everything you need to deal with whatever the world can throw at you.',
    zh: '你此刻内在，已经拥有应对世间一切风雨所需的全部力量。',
    author: 'Brian Tracy',
    tag: 'Resolve'
  }
];
