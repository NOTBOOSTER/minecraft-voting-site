# Minecraft Voting Site

## Description

This is a self-hostable Minecraft server voting website. It allows you to create up to 4 distinct voting links and seamlessly integrate advertisements, such as Adistra, to monetize your site. Originally developed by NOTBOOSTER for private use, this project is now open to the public.

## Installation

1.  Ensure you have **Node.js** and **npm** (Node Package Manager) installed on your system. You can download them from [https://nodejs.org/](https://nodejs.org/).
2.  Open your terminal or command prompt and navigate to the project directory.
3.  Run the following command to install the necessary dependencies:

    ```bash
    npm run build
    ```

    This command will execute the script defined in your `package.json` to install all the required packages listed under `dependencies`.

## Setup

1.  **Rename Environment File:** First, duplicate the `.env.example` file and rename the copy to `.env`. This file will store your configuration settings.

    ```bash
    cp .env.example .env
    ```

2.  **Configure `.env` File:** Open the `.env` file with a text editor and modify the following variables according to your setup:

    ```
    IP=your_votifier_server_ip
    PORT=your_votifier_server_port
    VOTIFIER_TOKEN=your_votifier_token
    NAME=Your Server Name
    WEBSITE_URL=your_website_url
    WEBSITE_PORT=your_website_port
    ADISTRA_URL="" # Leave blank to disable banner ads
    ADISTRA_REDIRECT="" # Leave blank to disable redirect ads
    ```

    * **`IP`**: Enter the IP address of your Votifier server.
    * **`PORT`**: Specify the port your Votifier server is listening on. **Make sure this port is open in your firewall.**
    * **`VOTIFIER_TOKEN`**: Input the secret token configured in your Votifier plugin's configuration file on your Minecraft server.
    * **`NAME`**: Set the name of your Minecraft server. This name will be displayed in-game when players vote and on the voting website.
    * **`WEBSITE_URL`**: Enter the base URL of your website (e.g., `example.com` or `localhost`).
    * **`WEBSITE_PORT`**: Specify the port your website server will run on (e.g., `80`, `443`, or `3000` if you are developing locally). **Ensure this port matches your server configuration, especially if using a panel like Pterodactyl.**
    * **`ADISTRA_URL`**: Paste the HTML code for your Adistra banner ad unit here. **Leave it empty (`""`) to disable banner ads.**
    * **`ADISTRA_REDIRECT`**: Paste the HTML code for your Adistra redirect ad unit here. **Leave it empty (`""`) to disable redirect ads.**

3.  **Start the Server:** Once you have configured the `.env` file, navigate to your project directory in the terminal and run the following command to start the website server:

    ```bash
    npm run start
    ```

    This command will execute the script defined in your `package.json` to start your application. You should then be able to access your voting site in your web browser using the `WEBSITE_URL` and `WEBSITE_PORT` you configured.

## Dependencies

This project relies on the following Node.js packages:

* **express**: A fast, unopinionated, minimalist web framework for Node.js.
* **ejs**: An embedded JavaScript templating engine used for rendering dynamic HTML.
* **minecraft-server-util**: A utility library for querying information about Minecraft servers.
* **js-yaml**: A JavaScript YAML parser and stringifier.
* **dotenv**: A zero-dependency module that loads environment variables from a `.env` file into `process.env`.
* **body-parser**: A middleware for parsing request bodies (available with Express 4.16+).

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.