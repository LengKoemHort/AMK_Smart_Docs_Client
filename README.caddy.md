
# Caddy Web Server with Custom TLS Certificates

This project sets up a Caddy web server in a Docker container, serving HTTPS traffic on an IP address (e.g., `https://192.168.1.100`) with custom TLS certificates. It includes a reverse proxy to a backend service at `host.docker.internal:3000`, a test endpoint on port 3443, and an HTTP-to-HTTPS redirect on port 80.

## Features
- **HTTPS with Custom Certificates**: Uses `server.crt` and `server.key` for TLS on ports 443 and 3443.
- **Reverse Proxy**: Forwards requests on `https://<your-ip>` to a backend service at `host.docker.internal:3000`.
- **Test Endpoint**: Responds with "Hello from Caddy" on `https://<your-ip>:3443`.
- **HTTP-to-HTTPS Redirect**: Redirects `http://<your-ip>` to `https://<your-ip>` to ensure secure connections.
- **Dockerized Setup**: Runs Caddy in a Docker container with persistent storage and mounted configuration/certificates.
- **Access Logging**: Logs requests to `/var/log/caddy/access.log` for debugging.

## Prerequisites
- **Docker** and **Docker Compose** installed.
- A backend service running on the host at port 3000 (accessible via `host.docker.internal:3000`).
- An IP address for the server (e.g., `192.168.1.100`).
- TLS certificates (`server.crt` and `server.key`) in a local `./certs` directory.

## Setup

### 1. Generate TLS Certificates
Caddy uses custom certificates for HTTPS. Generate a self-signed certificate or use a local Certificate Authority (CA).

#### Option 1: Self-Signed Certificate
```bash
mkdir -p ./certs
openssl req -x509 -newkey rsa:4096 -keyout ./certs/server.key -out ./certs/server.crt -days 365 -nodes -subj "/CN=<your-ip>" -addext "subjectAltName=IP:<your-ip>"
chmod 644 ./certs/server.crt
chmod 600 ./certs/server.key
```
Replace `192.168.1.11` with your server's IP address. Note: Browsers will show a security warning for self-signed certificates unless manually trusted. run 
- `ipconfig` in window to see what is your IP Address
- `ipconfig getifaddr en0` in mac to see your IP Address

### ⚠️ If OpenSSL is not installed

**Windows**  
1. Download [Win64 OpenSSL Light](https://slproweb.com/products/Win32OpenSSL.html) and install.  
2. Check **“Add OpenSSL to PATH”** during installation.  
3. Restart terminal and verify:
```powershell
openssl version
```
**Linux**  
```bash
sudo apt update
sudo apt install openssl -y
openssl version
````


### 2. Create .env file
Create a `.env` in the project directory with the following content:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
# ADD below
NEXTJS_URL=host.docker.internal:3000
HOST_IP=<your-ip> #Change to match you IP
```
### 3. Set Up Docker Compose
This is the docker compose

```yaml
version: "3.8"
services:
  caddy:
    image: caddy:latest
    container_name: caddy
    ports:
      - "80:80"
      - "443:443"
      - "3443:3443"
    volumes:
      - caddy_data:/data
      - caddy_config:/config
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./certs:/etc/caddy/certs
    restart: unless-stopped
    command: ["caddy", "run", "--watch", "--config", "/etc/caddy/Caddyfile"]

volumes:
  caddy_data:
  caddy_config:
```

- Mounts `./certs` to `/etc/caddy/certs` for certificates.
- Mounts `./Caddyfile` to `/etc/caddy/Caddyfile`.
- Persists Caddy data and config in `caddy_data` and `caddy_config` volumes.

### 4. Directory Structure
Ensure your project directory looks like this:
```
project/
├── Caddyfile
├── certs/
│   ├── server.crt
│   ├── server.key
├── docker-compose.yml
```

## Running the Server

1. Start the Docker container:
   ```bash
   docker-compose up -d
   ```

2. Verify the container is running:
   ```bash
   docker ps
   ```

3. Check Caddy logs for startup errors:
   ```bash
   docker logs caddy
   ```
4. Open another terminal and run

```bash
npm run dev
```

## Testing

1. **HTTP Redirect**: Visit `http://<your-ip>` to confirm it redirects to `https://<your-ip>`.
2. **Reverse Proxy**: Access `https://<your-ip>` to verify the backend at `host.docker.internal:3000`. Trust the certificate in your browser if needed.
3. **Test Endpoint**: Visit `https://<your-ip>:3443` to see "Hello from Caddy".
4. **Access Logs**: Check request logs:
   ```bash
   docker exec caddy cat /var/log/caddy/access.log
   ```

## Troubleshooting

- **Certificates Not Mounted**:
  - Verify `./certs` contains `server.crt` and `server.key`:
    ```bash
    ls -l ./certs
    ```
  - Check container filesystem:
    ```bash
    docker exec caddy ls -l /etc/caddy/certs
    ```
  - If missing, ensure `./certs` is in the same directory as `docker-compose.yml` or use an absolute path (e.g., `/full/path/to/certs:/etc/caddy/certs`).

- **Backend Unreachable**:
  - Test connectivity to `host.docker.internal:3000`:
    ```bash
    docker exec caddy curl http://host.docker.internal:3000
    ```
  - If it fails (e.g., on Linux), replace `host.docker.internal:3000` in the `Caddyfile` with the host IP (e.g., `192.168.1.100:3000`) and reload:
    ```bash
    docker exec caddy caddy reload --config /etc/caddy/Caddyfile
    ```
  - Alternatively, add a host mapping in `docker-compose.yml`:
    ```yaml
    services:
      caddy:
        ...
        extra_hosts:
          - "host.docker.internal:192.168.1.100"
    ```

- **Certificate Warnings**:
  - For self-signed certificates, manually trust `server.crt` in your browser.
  - For a local CA, install `ca.crt` in the client’s trusted root certificate store.

- **HTTP/2 and HTTP/3**:
  - The `redir` directive ensures HTTP/2 and HTTP/3 work on ports 443 and 3443. Ensure UDP is allowed on these ports for HTTP/3.

## Notes
- **Production**: For production, use a domain name with Let’s Encrypt instead of an IP address for trusted certificates.
- **Docker Networking**: `host.docker.internal` works on Docker Desktop (Windows/Mac). On Linux, use the host IP or configure a network.
- **Logs**: Caddy stores autosaved configs in `/config/caddy/autosave.json` and TLS data in `/data/caddy`, as seen in runtime logs.