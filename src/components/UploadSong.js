import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import ProgressBar from "react-bootstrap/ProgressBar";
import { v4 as uuidv4 } from "uuid";

function UploadSong(props) {
	const [selectedSong, setSelectedSong] = useState("");
	const [isSongPicked, setIsSongPicked] = useState(false);
	const [selectedImage, setSelectedImage] = useState("");
	const [isImagePicked, setIsImagePicked] = useState(false);
	const [imageDownloadURL, setImageDownloadURL] = useState("");
	const [songDownloadURL, setSongDownloadURL] = useState("");
	const [title, setTitle] = useState("");
	const [uploadInProgress, setUploadInProgress] = useState(false);
	const [songUploadPercent, setSongUploadPercent] = useState(0);
	const [imageUploadPercent, setImageUploadPercent] = useState(0);
	const [imageStoragePath, setImageStoragePath] = useState("");
	const [songStoragePath, setSongStoragePath] = useState("");

	function songChangeHandler(event) {
		setSelectedSong(event.target.files[0]);
		setIsSongPicked(true);
	}

	function imageChangeHandler(event) {
		setSelectedImage(event.target.files[0]);
		setIsImagePicked(true);
	}

	// Handles pressing of submit button on form
	async function handleUpload(e) {
		setUploadInProgress(true);
		const songStorageUUID = uuidv4();
		const imageStorageUUID = uuidv4();
		setImageStoragePath(`images/${imageStorageUUID}`);
		setSongStoragePath(`songs/${songStorageUUID}`);
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
						setImageDownloadURL(downloadURL);
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
					setUploadInProgress(false);
					setIsImagePicked(false);
					setIsSongPicked(false);
					props.setFeedbackModalText("Upload Complete");
					props.setShowFeedbackModal(true);
					window.setTimeout(() => {
						props.setShowFeedbackModal(false);
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
						setSongDownloadURL(downloadURL);
					}
				);
			}
		);
	}

	useEffect(() => {
		const addSong = async () => {
			try {
				const docRef = await addDoc(collection(db, "songs"), {
					title: title,
					imageURL: imageDownloadURL,
					songURL: songDownloadURL,
					imageStoragePath: imageStoragePath,
					songStoragePath: songStoragePath,
				});
				setSelectedImage(null);
				setSelectedSong(null);
				console.log("Document written with ID: ", docRef.id);
			} catch (e) {
				console.log("Error adding document: ", e);
			}
		};

		if (
			imageDownloadURL !== "" &&
			imageDownloadURL !== undefined &&
			songDownloadURL !== "" &&
			songDownloadURL !== undefined
		) {
			console.log("ADDING SONG TO COLLECTION");
			addSong().catch(console.error);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [songDownloadURL]);

	const handleClose = () => props.setShow(false);
	return (
		<>
			<Modal show={props.show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Upload Song</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={handleUpload}>
						<Form.Group controlId="formBasicTitle" className="mb-3">
							<Form.Label>Title</Form.Label>
							<Form.Control
								type="text"
								placeholder="Enter title"
								onChange={(e) => setTitle(e.target.value)}
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Song File</Form.Label>
							<Form.Control
								id="songInput"
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
						{!uploadInProgress &&
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
									Upload
								</Button>
							))}
					</Form>
					{uploadInProgress && (
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

export default UploadSong;
