function convertSnakeCaseToTitleCase(string: string) {
  return string
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export {convertSnakeCaseToTitleCase};
