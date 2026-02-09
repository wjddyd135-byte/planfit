
document.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector(".form");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;
    const nickname = document.getElementById("nickname").value.trim();
    const goal = document.getElementById("goal").value;
    const agree = document.getElementById("agree").checked;

    if (password !== password2) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!agree) {
      alert("약관에 동의해주세요.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("planfit_users")) || [];

    const existUser = users.find(user => user.email === email);

    if (existUser) {
      alert("이미 가입된 이메일입니다.");
      return;
    }

    const newUser = {
      email,
      password,
      nickname,
      goal,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    localStorage.setItem("planfit_users", JSON.stringify(users));

    alert("회원가입이 완료되었습니다!");

    window.location.href = "login.html";
  });

});
