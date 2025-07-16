export default {
  rules: {
    "selector-class-pattern": [
      "^[a-z][a-zA-Z0-9]*$",
      {
        // Вариант 1: printf‑подстановка
        // "%s" будет заменён на имя некорректного селектора
        message: 'Class selector "%s" should be in camelCase (no hyphens)',

        // Вариант 2: функция — ещё более гибко
        // message: selector => `Class selector "${selector}" should be in camelCase (no hyphens)`,

        resolveNestedSelectors: true,
      },
    ],
  },
};
