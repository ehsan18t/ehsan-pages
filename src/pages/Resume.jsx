import React from 'react'
import './resume.css'
import Linkedin from '../components/icons/Linkedin'
import Email from '../components/icons/Email'
import Github from '../components/icons/Github'
import Telephone from '../components/icons/Telephone'
import useDocumentTitle from '../assets/js/useDocumentTitle'

const Resume = () => {
  useDocumentTitle("Ehsan Khan's Profile")

  return (
    <div className="container">
      <div className="top-header">
        <div className="profile-picture-container">
          <img className="profile-picture" src="me.png" alt="profile picture" />
        </div>

        <div className="profile">
          <h1>Ehsan Khan</h1>
          <h2>Software Developer</h2>
          <p>
            A passionate developer, competitive programer, quick learner.
            Typical introvert. Love to code and learn new things.
          </p>
          <div className="hr">
            <br />
            <br />
          </div>
        </div>
      </div>
      <div className="bottom">
        <div className="left-side">
          <div className="contact">
            <h2>Contact</h2>
            <a href="mailto:ehsan18t@gmail.com">
              <Email className="svg-icon" /> ehsan18t@gmail.com
            </a>
            <a href="tel:01700000000">
              <Telephone className="svg-icon" /> +8801641723411
            </a>
            <a href="https://github.com/ehsan18t">
              <Github className="svg-icon" /> @ehsan18t
            </a>
            <a href="https://www.linkedin.com/in/ehsan18t/">
              <Linkedin className="svg-icon" /> @ehsan18t
            </a>
          </div>

          <div className="education">
            <h2>Education</h2>
            <div className="school">
              <h3>United International University</h3>
              <h4>Computer Science Engineering</h4>
              <p>2020-Present</p>
            </div>
          </div>
        </div>
        <div className="right-side">
          <div className="skills">
            <h2>Skills</h2>
            <ul>
              <li>HTML</li>
              <li>CSS</li>
              <li>JavaScript</li>
              <li>TailwindCSS</li>
              <li>Svelte</li>
              <li>React</li>
              <li>Django</li>
              <li>SQL</li>
              <li>Git</li>
              <li>GitHub</li>
              <li>C/C++</li>
              <li>Java</li>
              <li>Python</li>
              <li>C#</li>
              <li>PHP</li>
              <li>Vim</li>
              <li>Bash</li>
              <li>Batch</li>
              <li>Markdown</li>
              <li>Jira</li>
              <li>Scrum</li>
            </ul>
          </div>
          <div className="projects">
            <h2>Projects</h2>
            <div className="project">
              <h3>Win-10-Ultimate-System-Tweaks</h3>
              <p>
                A script/tool to make windows 10 better by adding useful
                features & tools, disabling useless services, turning off
                logging and sending data to third-party and removing garbage.
              </p>
              <a href="https://github.com/ehsan18t/Win10-Ultimate-System-Tweaks">
                View on GitHub
              </a>
            </div>
          </div>
          <div className="experience">
            <h2>Experience</h2>
            <div className="job">
              <h3>OS Modder</h3>
              <h4>MagicX Mod</h4>
              <p>2018-Present</p>
            </div>
            <div className="job">
              <h3>Android ROM Developer</h3>
              <h4>InfinityOS</h4>
              <p>2018-2019</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Resume
