import ProfileCard from "../components/ProfileCard";
import SharedNavbar from "../components/SharedNavbar";

export default function Profile() {
  return (
    <>
      <SharedNavbar activeTab="profile" />
      <div style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "100px 20px"
      }}>
        <ProfileCard />
      </div>
    </>
  );
}
