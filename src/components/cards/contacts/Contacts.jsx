import React from 'react'
import Telephone from '../../icons/Telephone'
import './contacts.css'

import { CiLinkedin, CiMail } from 'react-icons/ci'
import { VscGithub } from 'react-icons/vsc'

const Contact = (Info) => {
  return (
    <div className="contact">
      <h2>Contact</h2>
      <a target="_blank" href={'mailto:' + Info.contact.email}>
        <CiMail className="svg-icon" />
        {Info.contact.email}
      </a>
      {Info.contact.phone && (
        <a target="_blank" href={'tel:' + Info.contact.phone}>
          <Telephone className="svg-icon" /> {Info.contact.phone}
        </a>
      )}
      <a target="_blank" href={'https://github.com/' + Info.contact.github}>
        <VscGithub className="svg-icon" /> @{Info.contact.github}
      </a>
      <a target="_blank" href={'https://www.linkedin.com/in/' + Info.contact.linkedin}>
        <CiLinkedin className="svg-icon" /> @{Info.contact.linkedin}
      </a>
    </div>
  )
}

export default Contact
