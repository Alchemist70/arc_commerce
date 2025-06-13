import React from "react";
import "../styles/Modal.css";

const Modal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-body">
          <p>{message}</p>
          <button className="modal-button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
