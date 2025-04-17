document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('user-form');
    const usersList = document.getElementById('users-list');

    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const age = document.getElementById('age').value;

        try {
            const response = await fetch('https://car-vs-car-api.onrender.com/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, age })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const user = await response.json();
            appendUserToList(user);
            userForm.reset();
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    });

    async function fetchUsers() {
        try {
            const response = await fetch('https://car-vs-car-api.onrender.com/users/all');
            const users = await response.json();
            users.forEach(user => appendUserToList(user));
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }

    function appendUserToList(user) {
        const li = document.createElement('li');
        li.textContent = `${user.name} (${user.email}) - Age: ${user.age}`;
        usersList.appendChild(li);
    }

    fetchUsers();
});
