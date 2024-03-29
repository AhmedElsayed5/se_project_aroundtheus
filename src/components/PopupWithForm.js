import Popup from "./Popup.js";

export default class PopupWithForms extends Popup {
  constructor(popupSelector, handleFormSubmit) {
    super(popupSelector);
    this._modalForm = this._modal.querySelector("form");
    this._handleFormSubmit = handleFormSubmit;
    this._submitButton = this._modal.querySelector(".modal__save-button");
    this._inputList = Array.from(
      this._modalForm.querySelectorAll(".modal__input")
    );
  }

  close() {
    this._modalForm.reset();
    super.close();
  }
  _getInputValues() {
    const inputValues = {};
    this._inputList.forEach((input) => {
      inputValues[input.name] = input.value;
    });
    return inputValues;
  }

  renderLoading(isLoading, textValue) {
    if (isLoading) this._submitButton.textContent = "Loading...";
    else this._submitButton.textContent = textValue;
  }

  setEventListeners() {
    super.setEventListeners();
    this._modalForm.addEventListener("submit", (evt) => {
      evt.preventDefault();
      this._handleFormSubmit(this._getInputValues());
    });
  }
}
