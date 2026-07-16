import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaMapMarkerAlt, FaHotel, FaPlane, FaComments, FaUpload, FaPlayCircle, FaMicrophone } from "react-icons/fa";

const defaultReviews = [
	{
		id: 1,
		type: "text",
		title: "Amazing Bali sunset",
		content: "The beach clubs, food, and sunset views were unforgettable. Highly recommend staying near Seminyak.",
		createdAt: "Today",
		mediaName: null,
		mediaUrl: null,
	},
	{
		id: 2,
		type: "audio",
		title: "Voice review from Paris",
		content: "Recorded a short travel voice note after visiting the Louvre and Seine river walk.",
		createdAt: "2 days ago",
		mediaName: "paris-voice-note.mp3",
		mediaUrl: null,
	},
	{
		id: 3,
		type: "video",
		title: "Tokyo street video",
		content: "Captured the neon streets of Shibuya crossing during the evening rush.",
		createdAt: "1 week ago",
		mediaName: "tokyo-explore.mp4",
		mediaUrl: null,
	},
];

const storageKey = "dashboard-reviews";

function Dashboard() {
	const navigate = useNavigate();
	const [activeSection, setActiveSection] = useState("reviews");
	const [reviewText, setReviewText] = useState("");
	const [reviewTitle, setReviewTitle] = useState("");
	const [audioFile, setAudioFile] = useState(null);
	const [videoFile, setVideoFile] = useState(null);

	const [reviews, setReviews] = useState(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(storageKey));
			return Array.isArray(saved) && saved.length ? saved : defaultReviews;
		} catch {
			return defaultReviews;
		}
	});

	const reviewStats = useMemo(() => {
		return {
			total: reviews.length,
			text: reviews.filter((review) => review.type === "text").length,
			audio: reviews.filter((review) => review.type === "audio").length,
			video: reviews.filter((review) => review.type === "video").length,
		};
	}, [reviews]);

	const saveReviews = (nextReviews) => {
		setReviews(nextReviews);
		localStorage.setItem(storageKey, JSON.stringify(nextReviews));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const nextItems = [];
		const baseTitle = reviewTitle.trim() || "New trip review";
		const baseContent = reviewText.trim() || "No text entered — uploaded media only.";
		const nowLabel = "Just now";

		if (reviewText.trim()) {
			nextItems.push({
				id: Date.now(),
				type: "text",
				title: baseTitle,
				content: reviewText.trim(),
				createdAt: nowLabel,
				mediaName: null,
				mediaUrl: null,
			});
		}

		if (audioFile) {
			nextItems.push({
				id: Date.now() + 1,
				type: "audio",
				title: `${baseTitle} - Audio`,
				content: baseContent,
				createdAt: nowLabel,
				mediaName: audioFile.name,
				mediaUrl: URL.createObjectURL(audioFile),
			});
		}

		if (videoFile) {
			nextItems.push({
				id: Date.now() + 2,
				type: "video",
				title: `${baseTitle} - Video`,
				content: baseContent,
				createdAt: nowLabel,
				mediaName: videoFile.name,
				mediaUrl: URL.createObjectURL(videoFile),
			});
		}

		if (!nextItems.length) return;

		saveReviews([...nextItems.reverse(), ...reviews]);
		setReviewTitle("");
		setReviewText("");
		setAudioFile(null);
		setVideoFile(null);
		e.target.reset();
	};

	const sidebarItems = [
		{ icon: <FaHome />, label: "Home", action: () => navigate("/home") },
		{ icon: <FaMapMarkerAlt />, label: "Places", action: () => navigate("/search?tab=places") },
		{ icon: <FaHotel />, label: "Hotels", action: () => navigate("/search?tab=hotels") },
		{ icon: <FaPlane />, label: "Flights", action: () => navigate("/search?tab=flights") },
		{ icon: <FaComments />, label: "Reviews", action: () => setActiveSection("reviews"), active: activeSection === "reviews" },
	];

	return (
		<div style={pageStyle}>
			<aside style={sidebarStyle}>
				<h2 style={brandStyle}>Travel Dashboard 🌍</h2>

				<div style={menuWrapStyle}>
					{sidebarItems.map(({ icon, label, action, active }) => (
						<div
							key={label}
							onClick={action}
							style={{
								...menuItemStyle,
								background: active ? "#1d4ed840" : "transparent",
								color: active ? "#3b82f6" : "#94a3b8",
								borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
							}}
						>
							{icon} {label}
						</div>
					))}
				</div>

				<div style={sidebarCardStyle}>
					<div style={sidebarLabelStyle}>Review stats</div>
					<div style={{ marginTop: 12, display: "grid", gap: 10 }}>
						<StatLine label="Total" value={reviewStats.total} />
						<StatLine label="Text" value={reviewStats.text} />
						<StatLine label="Audio" value={reviewStats.audio} />
						<StatLine label="Video" value={reviewStats.video} />
					</div>
				</div>
			</aside>

			<main style={mainStyle}>
				<section style={heroStyle}>
					<div>
						<div style={sectionTagStyle}>Reviews center</div>
						<h1 style={heroTitleStyle}>Collect text, audio, and video reviews in one place</h1>
						<p style={heroTextStyle}>
							Give travelers a richer way to share feedback — quick text notes, voice reviews, and short video clips.
						</p>
					</div>
					<button onClick={() => setActiveSection("reviews")} style={primaryButtonStyle}>Open Reviews</button>
				</section>

				{activeSection === "reviews" && (
					<div style={{ display: "grid", gridTemplateColumns: "minmax(330px, 0.95fr) minmax(320px, 1.05fr)", gap: 18, alignItems: "start" }}>
						<section style={panelStyle}>
							<div style={panelHeaderStyle}>
								<div>
									<div style={sectionTagStyle}>Add new review</div>
									<h2 style={panelTitleStyle}>Upload a review</h2>
								</div>
								<FaUpload color="#93c5fd" />
							</div>

							<form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
								<div>
									<label style={fieldLabelStyle}>Review title</label>
									<input
										value={reviewTitle}
										onChange={(e) => setReviewTitle(e.target.value)}
										placeholder="Trip summary or destination name"
										style={inputStyle}
									/>
								</div>

								<div>
									<label style={fieldLabelStyle}>Text review</label>
									<textarea
										value={reviewText}
										onChange={(e) => setReviewText(e.target.value)}
										placeholder="Share what you liked, what to avoid, and any travel tips..."
										rows={6}
										style={{ ...inputStyle, resize: "vertical", minHeight: 140 }}
									/>
								</div>

								<div style={uploadGridStyle}>
									<div style={uploadCardStyle}>
										<div style={uploadHeaderStyle}>
											<FaMicrophone color="#93c5fd" />
											<div>
												<div style={uploadTitleStyle}>Audio review</div>
												<div style={uploadHintStyle}>Upload mp3, wav, or m4a</div>
											</div>
										</div>
										<input
											type="file"
											accept="audio/*"
											onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
											style={fileInputStyle}
										/>
										{audioFile && <FilePreview name={audioFile.name} type="Audio" />}
									</div>

									<div style={uploadCardStyle}>
										<div style={uploadHeaderStyle}>
											<FaPlayCircle color="#93c5fd" />
											<div>
												<div style={uploadTitleStyle}>Video review</div>
												<div style={uploadHintStyle}>Upload mp4, mov, or webm</div>
											</div>
										</div>
										<input
											type="file"
											accept="video/*"
											onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
											style={fileInputStyle}
										/>
										{videoFile && <FilePreview name={videoFile.name} type="Video" />}
									</div>
								</div>

								<button type="submit" style={primaryButtonStyle}>Save review</button>
							</form>
						</section>

						<section style={panelStyle}>
							<div style={panelHeaderStyle}>
								<div>
									<div style={sectionTagStyle}>Published reviews</div>
									<h2 style={panelTitleStyle}>Recent submissions</h2>
								</div>
								<div style={{ color: "#94a3b8", fontSize: 13 }}>{reviews.length} items</div>
							</div>

							<div style={{ display: "grid", gap: 14 }}>
								{reviews.map((review) => (
									<article key={review.id} style={reviewCardStyle}>
										<div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
											<div>
												<div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
													<h3 style={{ margin: 0, fontSize: 16, color: "white" }}>{review.title}</h3>
													<span style={typeBadgeStyle(review.type)}>{review.type} review</span>
												</div>
												<div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>{review.createdAt}</div>
											</div>
										</div>

										<p style={{ margin: "12px 0 0", color: "#cbd5e1", fontSize: 13, lineHeight: 1.7 }}>{review.content}</p>

										{review.mediaName && (
											<div style={mediaChipStyle}>
												Attached file: <strong>{review.mediaName}</strong>
											</div>
										)}

										{review.type === "audio" && review.mediaUrl && (
											<audio controls style={{ width: "100%", marginTop: 12 }} src={review.mediaUrl} />
										)}

										{review.type === "video" && review.mediaUrl && (
											<video controls style={videoStyle} src={review.mediaUrl} />
										)}
									</article>
								))}
							</div>
						</section>
					</div>
				)}
			</main>
		</div>
	);
}

function StatLine({ label, value }) {
	return (
		<div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
			<span style={{ color: "#94a3b8" }}>{label}</span>
			<strong style={{ color: "white" }}>{value}</strong>
		</div>
	);
}

function FilePreview({ name, type }) {
	return (
		<div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 12, background: "#0f172a", border: "1px solid #334155", color: "#cbd5e1", fontSize: 12 }}>
			{type}: {name}
		</div>
	);
}

const pageStyle = {
	display: "flex",
	minHeight: "100vh",
	background: "#0f172a",
	color: "white",
	fontFamily: "'Segoe UI', sans-serif",
};

const sidebarStyle = {
	width: 240,
	background: "#1e293b",
	padding: "28px 16px",
	flexShrink: 0,
	borderRight: "1px solid #334155",
	display: "flex",
	flexDirection: "column",
	gap: 16,
};

const brandStyle = {
	marginBottom: 8,
	fontSize: 17,
	fontWeight: 800,
	background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
	WebkitBackgroundClip: "text",
	WebkitTextFillColor: "transparent",
};

const menuWrapStyle = {
	display: "grid",
	gap: 4,
};

const menuItemStyle = {
	display: "flex",
	alignItems: "center",
	gap: 10,
	padding: "11px 16px",
	borderRadius: 10,
	cursor: "pointer",
	fontSize: 14,
	fontWeight: 500,
};

const sidebarCardStyle = {
	marginTop: "auto",
	background: "#0f172a",
	border: "1px solid #334155",
	borderRadius: 16,
	padding: 16,
};

const sidebarLabelStyle = {
	fontSize: 11,
	color: "#64748b",
	fontWeight: 700,
	textTransform: "uppercase",
	letterSpacing: 1,
};

const mainStyle = {
	flex: 1,
	padding: 24,
	overflowY: "auto",
};

const heroStyle = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	gap: 16,
	marginBottom: 20,
	padding: 24,
	borderRadius: 24,
	border: "1px solid rgba(148,163,184,0.16)",
	background: "linear-gradient(135deg, rgba(30,41,59,0.96), rgba(15,23,42,0.96))",
};

const sectionTagStyle = {
	fontSize: 12,
	color: "#93c5fd",
	fontWeight: 800,
	textTransform: "uppercase",
	letterSpacing: 1.3,
};

const heroTitleStyle = {
	margin: "10px 0 0",
	fontSize: 30,
	lineHeight: 1.15,
};

const heroTextStyle = {
	margin: "10px 0 0",
	maxWidth: 700,
	color: "#94a3b8",
	lineHeight: 1.7,
	fontSize: 14,
};

const primaryButtonStyle = {
	padding: "12px 18px",
	borderRadius: 12,
	border: "none",
	background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
	color: "white",
	fontWeight: 700,
	cursor: "pointer",
};

const panelStyle = {
	background: "#1e293b",
	border: "1px solid #334155",
	borderRadius: 22,
	padding: 18,
};

const panelHeaderStyle = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	gap: 10,
	marginBottom: 14,
};

const panelTitleStyle = {
	margin: "6px 0 0",
	fontSize: 22,
	color: "white",
};

const fieldLabelStyle = {
	display: "block",
	marginBottom: 8,
	fontSize: 12,
	color: "#94a3b8",
	fontWeight: 600,
};

const inputStyle = {
	width: "100%",
	background: "#0f172a",
	color: "white",
	border: "1px solid #334155",
	borderRadius: 14,
	padding: "12px 14px",
	outline: "none",
	fontSize: 14,
	boxSizing: "border-box",
};

const uploadGridStyle = {
	display: "grid",
	gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
	gap: 12,
};

const uploadCardStyle = {
	background: "#0f172a",
	border: "1px solid #334155",
	borderRadius: 18,
	padding: 14,
};

const uploadHeaderStyle = {
	display: "flex",
	alignItems: "center",
	gap: 10,
	marginBottom: 10,
};

const uploadTitleStyle = {
	color: "white",
	fontWeight: 700,
};

const uploadHintStyle = {
	fontSize: 12,
	color: "#64748b",
	marginTop: 2,
};

const fileInputStyle = {
	width: "100%",
	color: "#cbd5e1",
	fontSize: 13,
};

const reviewCardStyle = {
	background: "#0f172a",
	border: "1px solid #334155",
	borderRadius: 18,
	padding: 16,
};

const mediaChipStyle = {
	marginTop: 12,
	padding: "8px 10px",
	borderRadius: 12,
	background: "rgba(59,130,246,0.12)",
	color: "#cbd5e1",
	fontSize: 12,
};

const videoStyle = {
	width: "100%",
	marginTop: 12,
	borderRadius: 14,
	border: "1px solid #334155",
};

function typeBadgeStyle(type) {
	const color = type === "audio" ? "#22c55e" : type === "video" ? "#f59e0b" : "#3b82f6";
	return {
		fontSize: 11,
		padding: "4px 9px",
		borderRadius: 999,
		background: `${color}18`,
		border: `1px solid ${color}40`,
		color,
		textTransform: "capitalize",
		fontWeight: 700,
	};
}

export default Dashboard;
