import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { storage, db } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import EditSong from "./EditSong";

async function handleDelete(docID, songStoragePath, imageStoragePath) {
	console.log("starting delete action");
	// delete song document from firestore
	await deleteDoc(doc(db, "songs", docID));

	// delete songStorageRef
	const songStorageRef = ref(storage, songStoragePath);
	await deleteObject(songStorageRef)
		.then(() => {
			// File deleted successfully
		})
		.catch((error) => {
			console.log("error deleting song from firebase storage");
		});

	// delete imageStorageRef
	const imageStorageRef = ref(storage, imageStoragePath);
	await deleteObject(imageStorageRef)
		.then(() => {})
		.catch((error) => {
			if (error.code === "storage/object-not-found")
				console.log(
					"error deleting image from firebase storage: ",
					error
				);
		});
}

// Solution to not being able to pass props to popover and have it keep styling:
// https://stackoverflow.com/questions/38624923/react-bootstrap-popover-not-positioned-where-i-expect-it
const PopoverMenu = React.forwardRef((props, ref) => {
	return (
		<Popover id="popover-basic" {...props} ref={ref}>
			<Popover.Body className="pt-2 ps-2 pb-2 pe-2">
				<ListGroup variant="flush">
					<ListGroup.Item
						action
						onClick={() =>
							handleDelete(
								props.docid,
								props.songstoragepath,
								props.imagestoragepath
							)
						}
					>
						Delete
					</ListGroup.Item>
					<ListGroup.Item
						action
						onClick={() => props.setshoweditmodal(true)}
					>
						Edit
					</ListGroup.Item>
					<EditSong
						docID={props.docid}
						songTitle={props.songtitle}
						songStoragePath={props.songstoragepath}
						imageStoragePath={props.imagestoragepath}
						$show={props.showEditModal}
						setShow={props.setshoweditmodal}
						setShowAlert={props.setshowalert}
					/>
				</ListGroup>
			</Popover.Body>
		</Popover>
	);
});

function SongItem(props) {
	return (
		<ListGroup.Item
			as="li"
			className="d-flex justify-content-between align-items-center"
			key={props.docID}
		>
			<img
				src={props.imageURL}
				className="ms-3 me-2"
				alt="cover"
				width="50px"
				height="50px"
			></img>
			<div className="ms-2 me-auto">
				<div className="fw-bold">{props.songTitle}</div>
				{props.docID}
			</div>
			<audio controls className="me-4">
				<source src={props.songURL}></source>
			</audio>
			<OverlayTrigger
				trigger="click"
				rootClose
				placement="bottom"
				overlay={
					<PopoverMenu
						// Solution to so that update modal doesn't close after clicking on form field (problem caused by the rootClose property of the popover)
						// https://stackoverflow.com/questions/28935314/reactbootstrap-popover-dismiss-on-click-outside
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							e.nativeEvent.stopImmediatePropagation();
						}}
						docid={props.docID}
						songtitle={props.songTitle}
						imagestoragepath={props.imageStoragePath}
						songstoragepath={props.songStoragePath}
						setshoweditmodal={props.setShowEditModal}
						setshowalert={props.setShowAlert}
					/>
				}
			>
				<i
					className="fa-solid fa-ellipsis ms-4"
					style={{ fontSize: "1.5em", cursor: "pointer" }}
				></i>
			</OverlayTrigger>
		</ListGroup.Item>
	);
}

export default SongItem;
