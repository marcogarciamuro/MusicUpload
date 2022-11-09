import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { db, storage } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import ProgressBar from "react-bootstrap/ProgressBar";
import { v4 as uuidv4 } from "uuid";
import handleDelete from "./Music";

function EditSong(props) {
	const [selectedSong, setSelectedSong] = useState("");
	const [isSongPicked, setIsSongPicked] = useState(false);
	const [selectedImage, setSelectedImage] = useState("");
	const [isImagePicked, setIsImagePicked] = useState(false);
	const [newImageDownloadURL, setNewImageDownloadURL] = useState("");
	const [newSongDownloadURL, setNewSongDownloadURL] = useState("");
	const [title, setTitle] = useState(props.songTitle);
	const [updateInProgress, setUpdateInProgress] = useState(false);
	const [songUploadPercent, setSongUploadPercent] = useState(0);
	const [imageUploadPercent, setImageUploadPercent] = useState(0);
	const [newImageStoragePath, setNewImageStoragePath] = useState("");
	const [newSongStoragePath, setNewSongStoragePath] = useState("");

	function songChangeHandler(event) {
		setSelectedSong(event.target.files[0]);
		setIsSongPicked(true);
	}

	function imageChangeHandler(event) {
		setSelectedImage(event.target.files[0]);
		setIsImagePicked(true);
	}

	// Handles pressing of submit button on form
	async function handleUpdate(e) {
		setUpdateInProgress(true);
		const songDocRef = doc(db, "songs", props.docID);
		await updateDoc(songDocRef, {});
		const imageStorageUUID = uuidv4();
		const songStorageUUID = uuidv4();
		setNewImageStoragePath(`images/${imageStorageUUID}`);
		setNewSongStoragePath(`songs/${songStorageUUID}`);
		e.preventDefault();
		if (!selectedSong) {
			alert("Please choose an MP3 file first!");
		}
		if (!selectedImage) {
			alert("Please choose an image file first!");
		}

		const imageStorageRef = ref(storage, `images/${imageStorageUUID}`);
		const imageUploadTask = uploadBytesResumable(
			imageStorageRef,
			selectedImage
		);
		imageUploadTask.on(
			"state_changed",
			(snapshot) => {
				const progress = Math.round(
					(snapshot.bytesTransferred / snapshot.totalBytes) * 100
				);
				setImageUploadPercent(progress);
				console.log("TOTAL IMAGE UPLOAD PROGRESS: " + progress);
			},
			(error) => {
				switch (error.code) {
					case "storage/unauthorized":
						console.log(
							"You don't have permission to access the object"
						);
						break;
					case "storage/canceled":
						console.log("you canceled the upload");
						break;
					case "storage/cannot-slice-blob":
						console.log(
							"Local file has changed (deleted/saved again/ etc). Try uploading again after verifying the file hasn't changed"
						);
						break;
					case "storage/unknown":
						console.log("Unknown upload error");
						// Unknown error occurred, inspect error.serverResponse
						break;
					default:
						console.log("Other upload error");
				}
			},
			() => {
				getDownloadURL(imageUploadTask.snapshot.ref).then(
					(downloadURL) => {
						console.log("File available at", downloadURL);
						setNewImageDownloadURL(downloadURL);
					}
				);
			}
		);

		const songStorageRef = ref(storage, `songs/${songStorageUUID}`);
		const songUploadTask = uploadBytesResumable(
			songStorageRef,
			selectedSong
		);
		songUploadTask.on(
			"state_changed",
			(snapshot) => {
				const progress = Math.round(
					(snapshot.bytesTransferred / snapshot.totalBytes) * 100
				);
				console.log("TOTAL SONG UPLOAD PERCENT:" + progress);
				setSongUploadPercent(progress);
				if (progress === 100) {
					props.setShow(false);
					setSongUploadPercent(0);
					setImageUploadPercent(0);
					setUpdateInProgress(false);
					setIsImagePicked(false);
					setIsSongPicked(false);
					props.setShowAlert(true);
					window.setTimeout(() => {
						props.setShowAlert(false);
					}, 4000);
				}
			},
			(error) => {
				switch (error.code) {
					case "storage/unauthorized":
						console.log(
							"You don't have permission to access the object"
						);
						break;
					case "storage/canceled":
						console.log("you canceled the upload");
						break;
					case "storage/cannot-slice-blob":
						console.log(
							"Local file has changed (deleted/saved again/ etc). Try uploading again after verifying the file hasn't changed"
						);
						break;
					case "storage/unknown":
						console.log("Unknown upload error");
						// Unknown error occurred, inspect error.serverResponse
						break;
					default:
						console.log("Other upload error");
				}
			},
			() => {
				getDownloadURL(songUploadTask.snapshot.ref).then(
					(downloadURL) => {
						console.log("File available at", downloadURL);
						setNewSongDownloadURL(downloadURL);
					}
				);
			}
		);
	}

	// useEffect hook to update firestore document
	// and delete previous firebase storage references
	useEffect(() => {
		const updateSong = async () => {
			try {
				const docRef = doc(db, "songs", props.docID);
				await updateDoc(docRef, {
					title: title,
					imageURL: newImageDownloadURL,
					songURL: newSongDownloadURL,
					imageStoragePath: newImageStoragePath,
					songStoragePath: newSongStoragePath,
				});
				setSelectedImage(null);
				setSelectedSong(null);
				console.log("Document updated with ID: ", docRef.id);
			} catch (e) {
				console.log("Error editing document: ", e);
			}
		};

		if (
			newImageDownloadURL !== "" &&
			newImageDownloadURL !== undefined &&
			newSongDownloadURL !== "" &&
			newSongDownloadURL !== undefined
		) {
			console.log("UPDATING SONG DOCUMENT");
			updateSong().catch(console.error);
			handleDelete(
				props.docID,
				props.songStoragePath,
				props.imageStoragePath
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [newSongDownloadURL, newImageDownloadURL]);

	const handleClose = () => props.setShow(false);
	return (
		<>
			<Modal show={props.show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Edit Song</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={handleUpdate}>
						<Form.Group controlId="formBasicTitle" className="mb-3">
							<Form.Label>Title</Form.Label>
							<Form.Control
								type="text"
								placeholder="Enter title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</Form.Group>
						<Form.Group controlId="formBasicSong" className="mb-3">
							<Form.Label>Song File</Form.Label>
							<Form.Control
								type="file"
								placeholder="Enter song file"
								onChange={songChangeHandler}
							/>
						</Form.Group>
						<Form.Group controlId="formBasicImage" className="mb-3">
							<Form.Label>Cover Image</Form.Label>
							<Form.Control
								type="file"
								placeholder="Enter cover image file"
								onChange={imageChangeHandler}
							></Form.Control>
						</Form.Group>
						{/* if user has not started upload */}
						{!updateInProgress &&
							// if user has selected a song and an image, enable upload button
							(isSongPicked && isImagePicked ? (
								<div>
									<p>Filename: {selectedSong.name}</p>
									<Button
										variant="primary"
										type="submit"
										className="w-100"
									>
										Upload
									</Button>
								</div>
							) : (
								// if user has not selected both a song and image, disable upload button
								<Button
									variant="primary"
									className="w-100"
									disabled
								>
									Update
								</Button>
							))}
					</Form>
					{updateInProgress && (
						<ProgressBar
							animated
							now={Math.min(
								songUploadPercent,
								imageUploadPercent
							)}
						/>
					)}
					{/* add functionality to update song and image files */}
				</Modal.Body>
			</Modal>
		</>
	);
}

export default EditSong;
