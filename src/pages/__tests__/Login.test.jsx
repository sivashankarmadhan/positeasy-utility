// example 1

import { render, screen, fireEvent } from "@testing-library/react";
import Login from "../Login";

test("renders login form and handles input changes", () => {
  render(<Login onLogin={() => {}} />);

  // Select inputs by placeholder text
  const emailInput = screen.getByPlaceholderText("Email");
  const passwordInput = screen.getByPlaceholderText("Password");

  // Select button by role
  const loginButton = screen.getByRole("button", { name: /login/i });

  // Check initial values
  expect(emailInput.value).toBe("");
  expect(passwordInput.value).toBe("");

  // Simulate user typing
  fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  fireEvent.change(passwordInput, { target: { value: "password123" } });

  // Check if inputs updated correctly
  expect(emailInput.value).toBe("test@example.com");
  expect(passwordInput.value).toBe("password123");

  // Simulate form submission
  fireEvent.click(loginButton);
});

// ----------------------------------------------------------------

// example 2

// import { render, screen, fireEvent } from "@testing-library/react";
// import Login from "../Login";

// describe("Login Form", () => {
//   let emailInput, passwordInput, loginButton, mockOnLogin;

//   beforeEach(() => {
//     mockOnLogin = vi.fn(); // Mock login function
//     render(<Login onLogin={mockOnLogin} />);

//     // Select elements
//     emailInput = screen.getByPlaceholderText("Email");
//     passwordInput = screen.getByPlaceholderText("Password");
//     loginButton = screen.getByRole("button", { name: /login/i });
//   });

//   test("renders login form correctly", () => {
//     expect(emailInput).toBeInTheDocument();
//     expect(passwordInput).toBeInTheDocument();
//     expect(loginButton).toBeInTheDocument();
//   });

//   test("updates input values on change", () => {
//     fireEvent.change(emailInput, { target: { value: "test@example.com" } });
//     fireEvent.change(passwordInput, { target: { value: "password123" } });

//     expect(emailInput.value).toBe("test@example.com");
//     expect(passwordInput.value).toBe("password123");
//   });

//   test("calls onLogin with correct input when submitted", () => {
//     fireEvent.change(emailInput, { target: { value: "test@example.com" } });
//     fireEvent.change(passwordInput, { target: { value: "password123" } });
//     fireEvent.click(loginButton);

//     expect(mockOnLogin).toHaveBeenCalledTimes(1);
//     expect(mockOnLogin).toHaveBeenCalledWith("test@example.com", "password123");
//   });

//   test("does NOT call onLogin if fields are empty", () => {
//     fireEvent.click(loginButton);
//     expect(mockOnLogin).not.toHaveBeenCalled();
//   });

//   test("does NOT call onLogin if only email is provided", () => {
//     fireEvent.change(emailInput, { target: { value: "test@example.com" } });
//     fireEvent.click(loginButton);

//     expect(mockOnLogin).not.toHaveBeenCalled();
//   });

//   test("does NOT call onLogin if only password is provided", () => {
//     fireEvent.change(passwordInput, { target: { value: "password123" } });
//     fireEvent.click(loginButton);

//     expect(mockOnLogin).not.toHaveBeenCalled();
//   });

//   test("handles different cases dynamically", () => {
//     const testCases = [
//       { email: "", password: "", expected: false },
//       { email: "test@example.com", password: "", expected: false },
//       { email: "", password: "password123", expected: false },
//       { email: "test@example.com", password: "password123", expected: true },
//     ];

//     testCases.forEach(({ email, password, expected }) => {
//       fireEvent.change(emailInput, { target: { value: email } });
//       fireEvent.change(passwordInput, { target: { value: password } });
//       fireEvent.click(loginButton);

//       if (expected) {
//         expect(mockOnLogin).toHaveBeenCalledWith(email, password);
//       } else {
//         expect(mockOnLogin).not.toHaveBeenCalled();
//       }

//       // Reset mock function after each iteration
//       mockOnLogin.mockReset();
//     });
//   });
// });
