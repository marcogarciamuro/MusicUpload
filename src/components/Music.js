import UploadSong from "./UploadSong";
import FeedbackModal from "./FeedbackModal";
import EditSong from "./EditSong";
import React, { useEffect, useState } from "react";
import {
	collection,
	onSnapshot,
	doc,
	deleteDoc,
	setDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

class Song {
	constructor(
		id,
		title,
		songURL,
		songStoragePath,
		imageURL,
		imageStoragePath
	) {
		this.id = id;
		this.title = title;
		this.songURL = songURL;
		this.songStoragePath = songStoragePath;
		this.imageURL = imageURL;
		this.imageStoragePath = imageStoragePath;
	}
}

// async function handleSongUpdate

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

function Music() {
	const [songList, setSongList] = useState([]);
	const songColRef = collection(db, "songs");

	useEffect(() => {
		console.log("STARTING FIREBASE COLLECTION LISTENER");
		const unsubscribeFirestoreListener = onSnapshot(
			songColRef,
			(snapshot) => {
				const songs = [];
				snapshot.forEach((doc) => {
					const data = doc.data();
					const songObj = new Song(
						doc.id,
						data.title,
						data.songURL,
						data.songStoragePath,
						data.imageURL,
						data.imageStoragePath
					);
					songs.push(songObj);
				});
				setSongList(songs);
				console.log("current firestore songs: ", songs);
			}
		);
		return unsubscribeFirestoreListener;
	}, []);

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
							onClick={() => setShowEditModal(true)}
						>
							Edit
						</ListGroup.Item>
						<EditSong
							docID={props.docid}
							songTitle={props.songtitle}
							songStoragePath={props.songstoragepath}
							imageStoragePath={props.imagestoragepath}
							show={showEditModal}
							setShow={setShowEditModal}
							setShowAlert={setShowAlert}
						/>
					</ListGroup>
				</Popover.Body>
			</Popover>
		);
	});

	const songListItems = songList.map((song) => (
		<ListGroup.Item
			as="li"
			className="d-flex justify-content-between align-items-center"
			key={song.id}
		>
			<img
				src={song.imageURL}
				className="ms-3 me-2"
				alt="cover"
				width="50px"
				height="50px"
			></img>
			<div className="ms-2 me-auto">
				<div className="fw-bold">{song.title}</div>
				{song.id}
			</div>
			<audio controls className="me-4">
				<source src={song.songURL}></source>
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
						docid={song.id}
						songtitle={song.title}
						imagestoragepath={song.imageStoragePath}
						songstoragepath={song.songStoragePath}
					/>
				}
			>
				<i
					className="fa-solid fa-ellipsis ms-4"
					style={{ fontSize: "1.5em", cursor: "pointer" }}
				></i>
			</OverlayTrigger>
		</ListGroup.Item>
	));
	const [showAlert, setShowAlert] = useState(true);
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);
	const [feedbackModalText, setFeedbackModalText] = useState("");

	return (
		<>
			<Container>
				{showAlert && (
					<Alert
						variant="success"
						onClose={() => setShowAlert(false)}
						dismissible
					>
						Upload complete
					</Alert>
				)}
				<FeedbackModal
					className="float-end"
					show={showFeedbackModal}
					setShow={setShowFeedbackModal}
					text={feedbackModalText}
				/>

				<h1 className="text-center mt-4">Collections</h1>
				<Row>
					<Col>
						<Button
							variant="primary"
							className="float-end mt-4 mb-4"
							onClick={() => setShowUploadModal(true)}
						>
							Upload Song
						</Button>
						{/* <UploadSong
							setFeedbackModalText={setFeedbackModalText}
							show={showUploadModal}
							setShow={setShowUploadModal}
							setShowFeedbackModal={setShowFeedbackModal}
						/> */}
						<UploadSong
							setFeedbackModalText={setFeedbackModalText}
							show={showUploadModal}
							setShow={setShowUploadModal}
							setShowFeedbackModal={setShowFeedbackModal}
						/>
					</Col>
				</Row>
				<Row className="align-items-center">
					<Col>
						{songList.length === 0 ? (
							<h3 className="text-center">No songs available</h3>
						) : (
							<ListGroup as="ol" numbered>
								{songListItems}
							</ListGroup>
						)}
					</Col>
				</Row>
			</Container>
		</>
	);
}

export default Music;
