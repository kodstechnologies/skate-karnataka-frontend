export const initialDisciplineFormValues = {
  img: null,
  title: "",
  text: "",
  about: ""
};

export const disciplineFieldLabels = {
  img: "Discipline Image",
  title: "Title",
  text: "Text",
  about: "About"
};

export const createDisciplineFormValues = (discipline = {}) => ({
  img: null, // File inputs are never pre-filled
  title: discipline.title ?? "",
  text: discipline.text ?? "",
  about: discipline.about ?? ""
});
