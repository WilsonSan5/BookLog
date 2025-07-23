/**
 * authenticateUser - Handles user authentication logic.
 * This function supports registration, login, password hashing, token generation, and session management.
 * Uses localStorage for persistence and crypto for password hashing.
 */

async function authenticateUser(action, credentials) {
  // Helper: Hash password using SHA-256
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // Helper: Generate a random token
  function generateToken(length = 32) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // Helper: Get users from localStorage
  function getUsers() {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : {};
  }

  // Helper: Save users to localStorage
  function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  // Helper: Set session token
  function setSession(username, token) {
    localStorage.setItem(
      "session",
      JSON.stringify({ username, token, timestamp: Date.now() })
    );
  }

  // Helper: Get session
  function getSession() {
    const session = localStorage.getItem("session");
    return session ? JSON.parse(session) : null;
  }

  // Helper: Clear session
  function clearSession() {
    localStorage.removeItem("session");
  }

  // Registration logic
  if (action === "register") {
    const { username, password } = credentials;
    if (!username || !password) {
      return { success: false, message: "Username and password required." };
    }
    const users = getUsers();
    if (users[username]) {
      return { success: false, message: "Username already exists." };
    }
    const hashedPassword = await hashPassword(password);
    users[username] = { password: hashedPassword, createdAt: Date.now() };
    saveUsers(users);
    return { success: true, message: "Registration successful." };
  }

  // Login logic
  if (action === "login") {
    const { username, password } = credentials;
    if (!username || !password) {
      return { success: false, message: "Username and password required." };
    }
    const users = getUsers();
    if (!users[username]) {
      return { success: false, message: "User not found." };
    }
    const hashedPassword = await hashPassword(password);
    if (users[username].password !== hashedPassword) {
      return { success: false, message: "Incorrect password." };
    }
    const token = generateToken();
    setSession(username, token);
    return { success: true, message: "Login successful.", token };
  }

  // Logout logic
  if (action === "logout") {
    clearSession();
    return { success: true, message: "Logged out." };
  }

  // Check session logic
  if (action === "checkSession") {
    const session = getSession();
    if (!session) {
      return { success: false, message: "No active session." };
    }
    // Optional: session expiration (e.g., 1 hour)
    const expiresIn = 60 * 60 * 1000;
    if (Date.now() - session.timestamp > expiresIn) {
      clearSession();
      return { success: false, message: "Session expired." };
    }
    return {
      success: true,
      message: "Session active.",
      username: session.username,
      token: session.token,
    };
  }

  // Change password logic
  if (action === "changePassword") {
    const { username, oldPassword, newPassword } = credentials;
    if (!username || !oldPassword || !newPassword) {
      return { success: false, message: "All fields required." };
    }
    const users = getUsers();
    if (!users[username]) {
      return { success: false, message: "User not found." };
    }
    const oldHashed = await hashPassword(oldPassword);
    if (users[username].password !== oldHashed) {
      return { success: false, message: "Incorrect old password." };
    }
    const newHashed = await hashPassword(newPassword);
    users[username].password = newHashed;
    saveUsers(users);
    return { success: true, message: "Password changed successfully." };
  }

  // Default: unknown action
  return { success: false, message: "Unknown action." };
}
