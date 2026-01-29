const inputField = document.querySelector(".inputField");
const main = document.querySelector(".resume-builder");
const outputContainer = document.querySelector(".output-container");
let isHidden = true;

function hide() {
    if (isHidden) {
        // Toggle visibility
        main.style.display = "none";
        outputContainer.style.display = "block";
        isHidden = false;

        // Generate Resume HTML
        outputContainer.innerHTML = `
            <div class="output">
                <div class="heading">
                    <h1>${inputField["name"].value || 'Your Name'}</h1>
                    <h4>${inputField["title"].value || 'Professional Title'}</h4>
                </div>
                <div class="info">
                    <div class="left">
                        <div class="box">
                            <h2>Objective</h2>
                            <p>${inputField["objective"].value}</p>
                        </div>
                        <div class="box">
                            <h2>Skills</h2>
                            <p>${inputField["skills"].value}</p>
                        </div>
                        <div class="box">
                            <h2>Academic Details</h2>
                            <p>${inputField["academic_details"].value}</p>
                        </div>
                        <div class="box">
                            <h2>Contact</h2>
                            <p>${inputField["contact"].value}</p>
                        </div>
                    </div>
                    <div class="right">
                        <div class="box">
                            <h2>Work Experience</h2>
                            <p>${inputField["work_experience"].value}</p>
                        </div>
                        <div class="box">
                            <h2>Projects</h2>
                            <p>${inputField["projects"].value}</p>
                        </div>
                        <div class="box">
                            <h2>Achievements</h2>
                            <p>${inputField["achievements"].value}</p>
                        </div>
                    </div>
                </div>
            </div>
            <button class="main-btn" onclick="window.print()">Print / Save as PDF</button>
            <button class="main-btn back-btn" onclick="hide()" style="background: #666; margin-top: 10px;">Edit Info</button>
        `;
    } else {
        main.style.display = "block";
        outputContainer.style.display = "none";
        isHidden = true;
    }
}