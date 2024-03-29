import Card from "../components/Card.js";
import Api from "../components/Api.js";
import FormValidator from "../components/FormValidator.js";
import * as utils from "../utils/utils.js";
import PopupWithImage from "../components/PopupWithImage.js";
import PopupWithForm from "../components/popupWithForm.js";
import PopupWithConfirmation from "../components/PopupWithConfirmation.js";
import UserInfo from "../components/UserInfo.js";
import Section from "../components/Section.js";
import "./index.css";
// import { error } from "console";

const settings = {
  formSelector: ".form",
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__save-button",
  inactiveButtonClass: "modal__save-button_disabled",
  inputErrorClass: "form__input_type_error",
  errorClass: "form__input-error_active",
};

const api = new Api({
  baseUrl: "https://around.nomoreparties.co/v1/group-12",
  headers: {
    authorization: "95eecadc-0eb0-4813-b742-082777f22573",
    "Content-Type": "application/json",
  },
});

// Edit name and Description
const user = new UserInfo(
  ".profile__title",
  ".profile__description",
  ".profile__image"
);
const editProfileModal = new PopupWithForm("#profile-modal", (data) => {
  editProfileModal.renderLoading(true);
  api
    .updateProfileInfo({
      name: data.name,
      about: data.about,
    })
    .then((res) => {
      user.setUserInfo(res);
      editProfileModal.close();
    })
    .catch((error) => console.log(error))
    .finally(() => editProfileModal.renderLoading(false, "Save"));
});

// Edit Avatar
const editProfileAvatar = new PopupWithForm("#edit-avatar-modal", (data) => {
  editProfileAvatar.renderLoading(true);
  api
    .updateProfileAvatar(data.avatar)
    .then((res) => {
      user.setAvatar(res.avatar);
      editProfileAvatar.close();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      editProfileAvatar.renderLoading(false, "Save");
    });
});
const profileAvatar = document.querySelector(".profile__image-edit");
profileAvatar.addEventListener("click", handleProfileAvatar);
const editProfileAvatarForm = document.querySelector(
  "#modal__form-edit-avatar"
);
const editProfileAvatarFormValidator = new FormValidator(
  editProfileAvatarForm,
  settings
);
editProfileAvatarFormValidator.enableValidation();
function handleProfileAvatar() {
  editProfileAvatar.open();
  editProfileAvatar.setEventListeners();
  editProfileAvatarFormValidator.disableButton();
}

// Delete card

const deleteCardModal = new PopupWithConfirmation("#delete-image-modal");
deleteCardModal.setEventListeners();
let cardSection;
const imageFullView = new PopupWithImage("#image-modal");
imageFullView.setEventListeners();
const createCard = (data, currentUser) => {
  const card = new Card(
    data,
    "#card",
    () => {
      imageFullView.open({ name: data.name, link: data.link });
    },
    () => {
      deleteCardModal.open();
      deleteCardModal.setSubmitAction(() => {
        deleteCardModal.renderLoading(true);
        api
          .deleteUserCard(data._id)
          .then(() => {
            deleteCardModal.close();
            card.deleteCard();
          })
          .catch((err) => console.log(err))
          .finally(() => deleteCardModal.renderLoading(false));
      });
    },
    currentUser,
    () => {
      if (card.isLiked()) {
        api
          .removeCardLikes(card._cardId)
          .then((res) => {
            card.setLikeInfo(res.likes);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        api
          .addCardLikes(card._cardId)
          .then((res) => {
            card.setLikeInfo(res.likes);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  );
  return card.getView();
};

/// add card
const addCardModal = new PopupWithForm("#card-modal", ({ name, link }) => {
  addCardModal.renderLoading(true);
  api
    .addNewCard({ name, link })
    .then((res) => {
      cardSection.addItem(createCard(res, res.owner));
    })
    .then(() => addCardModal.close())
    .catch((err) => {
      console.log(err);
    })
    .finally(() => addCardModal.renderLoading(false, "Create"));
});

const editeProfileForm = document.querySelector("#formProfile");
const editeProfileFormValidator = new FormValidator(editeProfileForm, settings);
editeProfileFormValidator.enableValidation();

const addImageForm = document.querySelector("#modal__form-addCard");
const addImageFormValidator = new FormValidator(addImageForm, settings);
addImageFormValidator.enableValidation();

const editProfileButton = document.querySelector(".profile__edit-button");
editProfileButton.addEventListener("click", handleEditProfileButton);
function handleEditProfileButton() {
  const currentUser = user.getUserInfo();
  const currentUserNamePlace = document.querySelector("#name");
  const currentUserJobPlace = document.querySelector("#job");
  currentUserNamePlace.value = currentUser.name;
  currentUserJobPlace.value = currentUser.job;
  editeProfileFormValidator.disableButton();
  editProfileModal.open();
}
editProfileModal.setEventListeners();

const addCardButton = document.querySelector(".profile__add-button");
addCardButton.addEventListener("click", handleAddCardButton);
function handleAddCardButton() {
  addImageFormValidator.disableButton();
  addCardModal.open();
}
addCardModal.setEventListeners();

/// new part
api
  .getApiInfo()
  .then(([userData, userCards]) => {
    user.setUserInfo(userData);
    cardSection = new Section(
      {
        items: userCards,
        renderer: function (item) {
          cardSection.addItem(createCard(item, userData));
        },
      },
      ".cards__list"
    );
    cardSection.renderItems();
  })
  .catch((error) => {
    console.error("Error fetching API info:", error);
  });
