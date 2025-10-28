document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = createActivityCard(name, details);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  async function handleParticipantDelete(event) {
    const button = event.target;
    const activity = button.dataset.activity;
    const email = button.dataset.email;
    
    try {
        const response = await fetch(
            `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
            {
                method: "POST",
            }
        );

        const result = await response.json();

        if (response.ok) {
            // Refresh activities list to show updated participants
            activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
            await fetchActivities();
            
            messageDiv.textContent = result.message;
            messageDiv.className = "success";
        } else {
            messageDiv.textContent = result.detail || "An error occurred";
            messageDiv.className = "error";
        }

        messageDiv.classList.remove("hidden");

        // Hide message after 5 seconds
        setTimeout(() => {
            messageDiv.classList.add("hidden");
        }, 5000);
        
    } catch (error) {
        messageDiv.textContent = "Failed to unregister participant. Please try again.";
        messageDiv.className = "error";
        messageDiv.classList.remove("hidden");
        console.error("Error unregistering:", error);
    }
}

  function createActivityCard(name, details) {
    const card = document.createElement("div");
    card.className = "activity-card";

    card.innerHTML = `
        <h4>${name}</h4>
        <p><strong>Description:</strong> ${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Available Spots:</strong> ${details.max_participants - details.participants.length} / ${details.max_participants}</p>
        <div class="participants-section">
            <h5>Current Participants:</h5>
            <ul class="participants-list">
                ${details.participants.map(email => `
                    <li>
                        <span class="participant-email">${email}</span>
                        <button class="delete-participant" data-activity="${name}" data-email="${email}">×</button>
                    </li>`).join('')}
            </ul>
        </div>
    `;

    // Add click handlers for delete buttons
    card.querySelectorAll('.delete-participant').forEach(button => {
        button.addEventListener('click', handleParticipantDelete);
    });

    return card;
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list to show updated participants
        activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
