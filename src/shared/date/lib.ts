export function formatDate(date: Date) {
  const days = String(date.getDate()).padStart(2, "0");
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
  const month = months[date.getMonth()];
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${days} ${month} ${hours}:${minutes}`;
}
