import { landingVariants } from "./landingVariants.js"

const utpDefinitions = [
  {
    id: "square-galvanized-pipes",
    slug: "landing2",
    name: "Квадратные оцинкованные трубы",
    description:
      "Профильные оцинкованные трубы для металлоконструкций с контролем геометрии, шва и защитного покрытия.",
    ads: [
      {
        headline1: "Квадратные оцинкованные трубы",
        headline2: "Геометрия без сюрпризов",
        description:
          "Поставка профиля для металлоконструкций с контролем размеров, шва и цинкового слоя.",
      },
      {
        headline1: "Трубы квадратные под объект",
        headline2: "Крупные партии и сроки",
        description:
          "Комплектуем поставку под производство и монтаж без срыва графика объекта.",
      },
      {
        headline1: "Оцинкованный профиль для МК",
        headline2: "Стабильное качество партии",
        description:
          "Подходит для строительных и промышленных конструкций с понятными документами на поставку.",
      },
      {
        headline1: "Профильная труба оцинкованная",
        headline2: "КП по объёму и сечению",
        description:
          "Получите коммерческое предложение по профилю, количеству и срокам поставки.",
      },
    ],
  },
  {
    id: "rectangular-galvanized-pipes",
    slug: "landing3",
    name: "Прямоугольные оцинкованные трубы",
    description:
      "Прямоугольные трубы для каркасных и инженерных конструкций с точными размерами и защитой от коррозии.",
    ads: [
      {
        headline1: "Прямоугольные оцинкованные трубы",
        headline2: "Прочность для каркасных систем",
        description:
          "Поставляем профильные трубы для строительных проектов с гарантией размеров и покрытия.",
      },
      {
        headline1: "Профильные трубы под проект",
        headline2: "Точные размеры без брака",
        description:
          "Снижаем риск переделок на монтаже за счёт стабильной геометрии партии.",
      },
      {
        headline1: "Оцинкованные трубы для каркасов",
        headline2: "Под наружные конструкции",
        description:
          "Решение для навесов, ферм и инженерных конструкций с поставкой под объект.",
      },
      {
        headline1: "Прямоугольный профиль в поставку",
        headline2: "Расчёт цены и сроков",
        description:
          "Подготовим коммерческое предложение под ваш объём, сечение и график строительства.",
      },
    ],
  },
  {
    id: "electric-welded-galvanized-pipes",
    slug: "landing4",
    name: "Электросварные оцинкованные трубы",
    description:
      "Электросварные трубы для инженерных сетей и трубопроводов с проверкой шва и стойкостью к коррозии.",
    ads: [
      {
        headline1: "Электросварные оцинкованные трубы",
        headline2: "Прочный шов для инженерных сетей",
        description:
          "Поставка труб для водоснабжения и промышленных систем с проверкой сварного соединения.",
      },
      {
        headline1: "Трубы для воды и тепла",
        headline2: "Соответствие стандартам",
        description:
          "Снижаем риск закупки некачественной партии за счёт контроля параметров поставки.",
      },
      {
        headline1: "Оцинкованные электросварные трубы",
        headline2: "Защита от коррозии",
        description:
          "Подходят для тепловых сетей и технологических трубопроводов с высокой нагрузкой.",
      },
      {
        headline1: "Трубы под трубопровод",
        headline2: "Партия, сроки, документы",
        description:
          "Подготовим предложение по объёму, стандарту и срокам отгрузки под ваш объект.",
      },
    ],
  },
  {
    id: "stainless-pipes",
    slug: "landing5",
    name: "Нержавеющие трубы",
    description:
      "Нержавеющие трубы для пищевых, химических и фармацевтических производств с подтверждёнными характеристиками.",
    ads: [
      {
        headline1: "Нержавеющие трубы",
        headline2: "Для агрессивной среды и пищевки",
        description:
          "Поставка труб из нержавеющей стали для производств с высокими требованиями к материалу.",
      },
      {
        headline1: "Трубы из нержавейки",
        headline2: "Сертификаты и санитарные нормы",
        description:
          "Подберём решение для отраслей, где важны коррозионная стойкость и чистота среды.",
      },
      {
        headline1: "Нержавеющие трубы для производства",
        headline2: "Долгий ресурс без коррозии",
        description:
          "Снижаем риск замены трубопровода и остановок оборудования из-за разрушения металла.",
      },
      {
        headline1: "Поставка нержавеющих труб",
        headline2: "Марка, объём, назначение",
        description:
          "Подготовим коммерческое предложение по марке стали, диаметру и сфере применения.",
      },
    ],
  },
  {
    id: "heat-unit-kit",
    slug: "landing1",
    name: "Комплект теплового узла",
    description:
      "Комплект оборудования для теплового узла под проект с проверкой совместимости и поставкой одним комплектом.",
    ads: [
      {
        headline1: "Комплект теплового узла",
        headline2: "Один поставщик, один комплект",
        description:
          "Закрываем поставку ИТП одним контрактом с проверкой совместимости перед отгрузкой.",
      },
      {
        headline1: "Оборудование ИТП за 7 дней",
        headline2: "Совместимость проверена",
        description:
          "Арматура, насосы, КИП и соединительные элементы в одной поставке под ваш проект.",
      },
      {
        headline1: "Тепловой узел под проект",
        headline2: "Насосы, арматура, КИП",
        description:
          "Собираем комплект под спецификацию и помогаем не потерять время на разрозненных закупках.",
      },
      {
        headline1: "Закроем спецификацию узла",
        headline2: "КП и документы в одном пакете",
        description:
          "Подготовим состав поставки, коммерческое предложение и комплект документов для закупки.",
      },
    ],
  },
  {
    id: "industrial-valves",
    slug: "landing6",
    name: "Промышленная запорная арматура",
    description:
      "Запорная арматура для систем с высоким давлением и агрессивной средой с подбором под рабочие параметры.",
    ads: [
      {
        headline1: "Промышленная запорная арматура",
        headline2: "Под давление и среду",
        description:
          "Подбираем арматуру под рабочие условия, требования к материалу и отраслевой стандарт.",
      },
      {
        headline1: "Арматура по параметрам системы",
        headline2: "ГОСТ и подбор под задачу",
        description:
          "Снижаем риск ошибки в закупке за счёт подбора под давление, температуру и среду.",
      },
      {
        headline1: "Клапаны, задвижки, краны",
        headline2: "Надёжность для B2B-проектов",
        description:
          "Решение для промышленных и инженерных систем, где важна стабильная работа оборудования.",
      },
      {
        headline1: "Поставка промышленной арматуры",
        headline2: "Спецификация, сроки, документы",
        description:
          "Подготовим предложение по нужным позициям, срокам поставки и комплекту документации.",
      },
    ],
  },
  {
    id: "pump-equipment",
    slug: "landing7",
    name: "Насосное оборудование",
    description:
      "Подбор насосного оборудования под расход, напор и режим работы системы без переплаты за мощность.",
    ads: [
      {
        headline1: "Насосное оборудование за 24 часа",
        headline2: "Подбор под параметры системы",
        description:
          "Инженерный расчёт насосов под ваш расход, напор и рабочий режим без шаблонных решений.",
      },
      {
        headline1: "Инженерный расчёт насосов",
        headline2: "Без переплаты за мощность",
        description:
          "Помогаем подобрать оборудование без избыточного запаса и просадки по характеристикам.",
      },
      {
        headline1: "Насосы для объекта и производства",
        headline2: "Подберём по ТЗ и спецификации",
        description:
          "Работаем по проекту, техзаданию или параметрам действующей системы.",
      },
      {
        headline1: "Подбор насосного оборудования",
        headline2: "КП по системе и срокам",
        description:
          "Получите предложение по насосу, комплектующим и срокам поставки под ваш сценарий.",
      },
    ],
  },
  {
    id: "project-specification-supply",
    slug: "landing8",
    name: "Поставка по спецификации проекта",
    description:
      "Комплексная поставка оборудования по проектной спецификации одним договором с контролем совместимости позиций.",
    ads: [
      {
        headline1: "Закроем спецификацию проекта",
        headline2: "Один контракт на всю поставку",
        description:
          "Собираем оборудование по проектной ведомости и сводим закупку к одному поставщику.",
      },
      {
        headline1: "Поставка оборудования по спецификации",
        headline2: "Сверка совместимости позиций",
        description:
          "Снижаем риск расхождений между позициями и упрощаем координацию закупки.",
      },
      {
        headline1: "Комплексная поставка под проект",
        headline2: "Меньше поставщиков и рисков",
        description:
          "Подходит для объектов, где важно закрыть разные категории оборудования в одном контуре.",
      },
      {
        headline1: "Отправьте спецификацию",
        headline2: "Соберём КП и сроки поставки",
        description:
          "Подготовим коммерческое предложение по ведомости, бюджету и графику проекта.",
      },
    ],
  },
]

const landingContentMap = Object.fromEntries(
  landingVariants.map((landing) => [landing.slug, landing]),
)

export const utpCatalog = utpDefinitions.map((definition, index) => {
  const landing = landingContentMap[definition.slug]

  if (!landing) {
    throw new Error(`Landing content not found for slug "${definition.slug}"`)
  }

  return {
    ...landing,
    number: String(index + 1).padStart(2, "0"),
    utp: {
      id: definition.id,
      name: definition.name,
      description: definition.description,
    },
    ads: definition.ads.map((ad, adIndex) => ({
      id: `${definition.id}-ad-${adIndex + 1}`,
      label: `Объявление ${adIndex + 1}`,
      headline1: ad.headline1,
      headline2: ad.headline2,
      description: ad.description,
    })),
  }
})

export const utpCatalogMap = Object.fromEntries(
  utpCatalog.map((record) => [record.slug, record]),
)

export const utpList = utpCatalog.map((record) => ({
  id: record.utp.id,
  name: record.utp.name,
  description: record.utp.description,
  slug: record.slug,
}))

export const landingRecords = utpCatalog.map((record) => ({
  utp_id: record.utp.id,
  slug: record.slug,
  content_blocks: {
    hero: record.hero,
    problem: {
      title: record.problemTitle,
      items: record.problems,
    },
    solution: {
      title: record.solutionTitle,
      lead: record.solutionLead,
      items: record.solutionChecks,
    },
    benefits: {
      title: record.benefitsTitle,
      items: record.benefits,
    },
    applications: {
      title: record.applicationsTitle,
      items: record.applications,
    },
    cta: record.form,
  },
}))

export const adsRecords = utpCatalog.flatMap((record) =>
  record.ads.map((ad) => ({
    utp_id: record.utp.id,
    landing_slug: record.slug,
    headline_1: ad.headline1,
    headline_2: ad.headline2,
    description: ad.description,
  })),
)
