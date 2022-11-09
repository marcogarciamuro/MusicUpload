import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

export default function Navigation() {
	const { user } = useAuth();
	return (
		<div className="d-flex flex-column">
			<nav className="navbar navbar-expand-lg navbar-light bg-light">
				<div className="container">
					<Link to="/" className="navbar-brand">
						Navbar
					</Link>
					<button
						className="navbar-toggler"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#navbarNavDropdown"
						aria-controls="navbarNavDropdown"
						aria-expanded="false"
						aria-label="Toggle navigation"
					>
						<span className="navbar-toggler-icon"></span>
					</button>
					<div
						className="collapse navbar-collapse"
						id="navbarSupportedContent"
					>
						<ul className="navbar-nav ms-auto">
							<li className="nav-item">
								<Link to="/about" className="nav-link">
									About
								</Link>
							</li>
							<li className="nav-item">
								<Link to="/music" className="nav-link">
									Music
								</Link>
							</li>
							<li className="nav-item">
								{!user && (
									<Link to="/login" className="nav-link">
										Login
									</Link>
								)}
								{user && (
									<Link to="/login" className="nav-link">
										Logout
									</Link>
								)}
							</li>
						</ul>
					</div>
				</div>
			</nav>
		</div>
	);
}
