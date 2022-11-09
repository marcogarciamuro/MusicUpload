import React, { useState } from "react";
import Navigation from "../Navigation";
import { initializeApp } from "firebase/app";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";

export default function features() {
	return (
		<div>
			<Navigation />
		</div>
	);
}

function FileUploadPage() {
	const [selectedFile, setSelectedFile] = useState();
	const [isFilePicked, setIsFilePicked] = useState(false);

	const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
		setIsFilePicked(true);
	};

	const handleSubmission = () => {
		const formData = new FormData();
		formData.append("File", selectedFile);
		fetch(
			"https://freeimage.host/api/1/upload?key=6d207e02198a847aa98d0a2a901485a5",
			{
				method: "POST",
				body: formData,
			}
		)
			.then((response) => response.json())
			.then((result) => {
				console.log("Success:", result);
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	};

	return (
		<div className="card">
			<input type="file" name="file" onChange={changeHandler} />
			{isFilePicked ? (
				<div>
					<p>Filename: {selectedFile.name}</p>
					<p>Filetype: {selectedFile.type}</p>
					<p>Size: {selectedFile.size}</p>
				</div>
			) : (
				<p>Select a file</p>
			)}
			<div>
				<button onClick={handleSubmission}>Add</button>
			</div>
		</div>
	);
}
