import { PrismaClient, BlockType } from '@prisma/client'

const prisma = new PrismaClient()

const WEEK_TITLES = [
  { number: 1, title: 'Present Tenses', description: 'Simple Present, Present Continuous, Present Perfect' },
  { number: 2, title: 'Past Tenses', description: 'Simple Past, Past Continuous, Past Perfect' },
  { number: 3, title: 'Future Tenses', description: 'Will, Going To, Future Continuous' },
  { number: 4, title: 'Modal Verbs', description: 'Can, Could, Must, Should, May, Might' },
  { number: 5, title: 'Conditionals', description: 'Zero, First, Second, Third Conditionals' },
  { number: 6, title: 'Advanced Grammar', description: 'Passive Voice, Reported Speech, Relative Clauses' },
]

const DAY_TITLES: Record<number, string[]> = {
  1: [
    'Simple Present – Form & Use',
    'Simple Present – Negatives & Questions',
    'Simple Present – Adverbs of Frequency',
    'Present Continuous – Form & Use',
    'Present Continuous – State Verbs',
    'Present Continuous – Future Use',
    'Present Perfect – Have + Past Participle',
  ],
  2: [
    'Simple Past – Regular Verbs',
    'Simple Past – Irregular Verbs',
    'Simple Past – Questions & Negatives',
    'Past Continuous – Form & Use',
    'Past Continuous vs Simple Past',
    'Past Perfect – Form & Use',
    'Past Perfect – Timeline Practice',
  ],
  3: [
    'Will – Predictions & Decisions',
    'Going To – Plans & Intentions',
    'Will vs Going To',
    'Future Continuous – Form & Use',
    'Future Perfect – Form & Use',
    'Future Time Clauses',
    'Future in the Past',
  ],
  4: [
    'Can & Could – Ability',
    'Must & Have To – Obligation',
    'Should & Ought To – Advice',
    'May & Might – Possibility',
    'Would – Habits & Requests',
    'Need & Dare – Semi-modals',
    'Modal Verbs Review',
  ],
  5: [
    'Zero Conditional – Facts',
    'First Conditional – Real Possibilities',
    'Second Conditional – Unreal Present',
    'Third Conditional – Unreal Past',
    'Mixed Conditionals',
    'Unless, Provided, As Long As',
    'Conditionals Review',
  ],
  6: [
    'Passive Voice – Present & Past',
    'Passive Voice – All Tenses',
    'Reported Speech – Statements',
    'Reported Speech – Questions',
    'Defining Relative Clauses',
    'Non-Defining Relative Clauses',
    'Relative Clauses with Prepositions',
  ],
}

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.block.deleteMany()
  await prisma.day.deleteMany()
  await prisma.week.deleteMany()

  let dayCounter = 1

  for (const week of WEEK_TITLES) {
    const createdWeek = await prisma.week.create({
      data: {
        order: week.number,
        themeTitle: week.title,
        description: week.description,
      },
    })

    const titlesForWeek = DAY_TITLES[week.number] || []
    const daysInWeek = week.number <= 4 ? 7 : week.number === 5 ? 7 : 5
    const count = Math.min(daysInWeek, 40 - dayCounter + 1)

    for (let i = 0; i < count && dayCounter <= 40; i++) {
      const isDay1 = dayCounter === 1
      const dayOrder = i + 1 // Relative order inside the week

      const day = await prisma.day.create({
        data: {
          weekId: createdWeek.id,
          order: dayOrder,
          lessonTitle: titlesForWeek[i] ?? `Lesson ${dayOrder}`,
          isPublished: isDay1 ? true : false,
        },
      })

      // Seed Day 1 with sample blocks of all 4 types
      if (isDay1) {
        await prisma.block.createMany({
          data: [
            {
              dayId: day.id,
              type: BlockType.text,
              orderIndex: 1000,
              contentData: {
                variant: 'h1',
                content: 'Simple Present — Form & Use',
              },
            },
            {
              dayId: day.id,
              type: BlockType.callout,
              orderIndex: 2000,
              contentData: {
                emoji: '💡',
                color: 'blue',
                title: 'Key Rule',
                content: 'Use the Simple Present for habits, routines, and facts that are always true.',
              },
            },
            {
              dayId: day.id,
              type: BlockType.text,
              orderIndex: 3000,
              contentData: {
                variant: 'h2',
                content: 'Structure',
              },
            },
            {
              dayId: day.id,
              type: BlockType.table,
              orderIndex: 4000,
              contentData: {
                caption: 'Simple Present Formula',
                headers: ['Subject', 'Verb Form', 'Example'],
                rows: [
                  ['I / You / We / They', 'Base Verb', 'I play football.'],
                  ['He / She / It', 'Verb + s / es', 'She plays football.'],
                ],
              },
            },
            {
              dayId: day.id,
              type: BlockType.divider,
              orderIndex: 5000,
              contentData: {},
            },
            {
              dayId: day.id,
              type: BlockType.text,
              orderIndex: 6000,
              contentData: {
                variant: 'body-lg',
                content: 'Practice: Write three sentences about your daily routine using the Simple Present.',
              },
            },
          ],
        })
      }

      dayCounter++
    }
  }

  console.log(`✅ Seeded ${dayCounter - 1} days across ${WEEK_TITLES.length} weeks.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
