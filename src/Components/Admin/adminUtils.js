export const dateLabel = (value) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-";
