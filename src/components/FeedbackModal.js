import Modal from "react-bootstrap/Modal";
import React from "react";

function FeedbackModal(props) {
	return (
		<Modal
			size="sm"
			show={props.show}
			onHide={() => props.setShow(false)}
			dialogClassName="modal-90w"
		>
			<Modal.Header closeButton>
				<Modal.Title style={{ fontSize: "20px" }}>
					{props.text}
				</Modal.Title>
			</Modal.Header>
		</Modal>
	);
}

export default FeedbackModal;
