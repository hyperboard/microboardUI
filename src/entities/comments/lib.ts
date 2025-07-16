export function formatDate(date: Date) {
  const days = String(date.getDate()).padStart(2, "0"); // ДД
  const months = [
    "Янв.",
    "Фев.",
    "Мар.",
    "Апр.",
    "Мая",
    "Июня",
    "Июля",
    "Авг.",
    "Сен.",
    "Окт.",
    "Ноя.",
    "Дек.",
  ];
  const month = months[date.getMonth()]; // Месяц
  const hours = String(date.getHours()).padStart(2, "0"); // ЧЧ
  const minutes = String(date.getMinutes()).padStart(2, "0"); // ММ

  return `${days} ${month} ${hours}:${minutes}`;
}
