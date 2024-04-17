import { html, render } from "lit-html";

let servers = localStorage.servers ? JSON.parse(localStorage.servers) : [];

const update = async () => {
  const counts = await Promise.all(
    servers.map(async (server) => {
      const r = await fetch(
        `https://discord.com/api/v10/invites/${server}?with_counts=true`
      );
      if (!r.ok)
        return {
          server,
          success: false,
        };
      const data = await r.json();

      return {
        server,
        success: true,
        name: data.guild.name,
        count: data.approximate_member_count,
        count_online: data.approximate_presence_count,
      };
    })
  );
  const target = document.querySelector("#servers");
  render(
    counts.map((data) => {
      if (!data.success)
        return html`<div class="server">
          <h2>(${data.server})</h2>
          <p>Not found</p>
          <button @click=${() => remove(data.server)}>Remove</button>
        </div>`;
      return html`<div class="server">
        <h2>${data.name} (${data.server})</h2>
        <p>Members: ${data.count.toLocaleString()}</p>
        <p>Online: ${data.count_online.toLocaleString()}</p>
        <button @click=${() => remove(data.server)}>Remove</button>
      </div>`;
    }),
    target
  );
};
const remove = (server) => {
  servers = servers.filter((s) => s != server);
  localStorage.servers = JSON.stringify(servers);
  update();
};
const add = (server) => {
  servers.push(server);
  localStorage.servers = JSON.stringify(servers);
  update();
};

update();

const input = document.querySelector("input");
input.addEventListener("keydown", (e) => {
  if (e.key != "Enter") return;

  const server = input.value.split("/").at(-1);
  if (server) {
    input.value = "";
    add(server);
  }
});
