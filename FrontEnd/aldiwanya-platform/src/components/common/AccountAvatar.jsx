import { ASSET_BASE_URL } from "../../services/api";
import "./account-tools.css";
export default function AccountAvatar({ user, size = 40 }) {
  return (
    <span
      className="account-avatar"
      style={{ width: size, height: size, fontSize: Math.max(16, size * 0.34) }}
    >
      {user?.avatarUrl ? (
        <img
          src={ASSET_BASE_URL + user.avatarUrl}
          alt={"صورة حساب " + user.fullName}
        />
      ) : (
        <span aria-label="صورة الحساب الافتراضية">
          {user?.fullName?.charAt(0) || "أ"}
        </span>
      )}
    </span>
  );
}
