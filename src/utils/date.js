// src/utils/date.js
export const getNextAppointmentDate = (days) => {
  if (!days || isNaN(days)) return "-";

  const today = new Date();
  today.setDate(today.getDate() + Number(days));

  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
};
