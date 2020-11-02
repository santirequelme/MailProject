
document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('form').addEventListener('submit', () => send_email());  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email(){

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    }),
  })
  .then(response => response.json())
  .then (result => {
    if (result.message.includes('successfully')) {
      load_mailbox('sent');
    }  
  })
event.preventDefault()
}

function email_reply(data) {

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    
    document.querySelector('#compose-recipients').value = data.sender;
    if (data.subject.startsWith('Re: ')) {
      document.querySelector('#compose-subject').value = data.subject;
      }
    else {
      document.querySelector('#compose-subject').value = 'Re: ' + data.subject;
    }
    document.querySelector('#compose-body').value = 'On ' + data.timestamp + ' ' + data.sender + ' ' +'wrote: ' + data.body ;
}

function read_email(email_id, mailbox){

  fetch(`/emails/${email_id}`)
    .then((response) => response.json())
    .then((email) => {
      document.querySelector("#emails-view").innerHTML = "";
      var single_email = document.createElement("div");
      single_email.className = `card`;
      single_email.innerHTML = `<div class="card-body">
  <b>From:</b> ${email.sender}
  <br>
  <b>To</b>: ${email.recipients}
  <br>
  <b>Subject:</b> ${email.subject}
  <br>
  <b>Date and time:</b> ${email.timestamp}
  <hr>${email.body}
      </div>`;
      document.querySelector("#emails-view").appendChild(single_email);
      if (mailbox == "sent") return;
      
      let reply = document.createElement("btn");
      reply.className = `btn btn-sm btn-primary`;
      reply.textContent = "Reply";
      reply.addEventListener('click', () => email_reply(email) )
      document.querySelector("#emails-view").appendChild(reply);
      readed(email_id);

      
      let archive = document.createElement("btn");
      archive.className = `btn btn-sm btn-primary m-1`;
      archive.addEventListener("click", () => {
        switch_archive(email_id, email.archived);
        if (archive.innerText == "Archive") archive.innerText = "Unarchive";
        else archive.innerText = "Archive";
        load_mailbox('inbox'); 
      });
  
      if (!email.archived) archive.textContent = "Archive";
      else archive.textContent = "Unarchive";
      document.querySelector("#emails-view").appendChild(archive);

      
    });
}

function readed(email_id) {
  fetch(`/emails/${email_id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
}

function switch_archive(email_id, state) {
  fetch(`/emails/${email_id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !state,
    }),
  });
  location.reload(true);
}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  if (mailbox == "read_email") {
    read_email();
    return;
  }

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((element) => {
        if (mailbox == "inbox") {
          if (element.read) is_read = "readed";
          else is_read = "";
        } else is_read = "readed";
        var single_email = document.createElement("div");
        single_email.className = `card ${is_read} my-1 mailStyle`;
        single_email.innerHTML = `<div class="card-body" id="single_email-${element.email_id}">
        <b>From:</b> ${element.sender} <b>Subject:</b> ${element.subject} <b>Date and Time:</b> ${element.timestamp} 
        <br>
        </div>`;
        document.querySelector("#emails-view").appendChild(single_email);
        single_email.addEventListener("click", () => {
          read_email(element.id, mailbox);
        });
      });
    });
}