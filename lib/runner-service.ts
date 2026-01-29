import Docker from 'dockerode';
import path from 'path';
import fs from 'fs';


const docker = new Docker();

interface ContainerConfig {
    workspaceId: string;
    projectPath: string; // Host path where files are cloned
}

interface ContainerInfo {
    containerId: string;
    url: string; // http://localhost:PORT
    hostPort: number;
}

export class RunnerService {
    private static readonly IMAGE = 'gitpod/openvscode-server';
    private static readonly START_PORT = 10000;
    private static readonly MAX_PORT = 20000;

    /**
     * Spawns an OpenVSCode Server container for the given workspace.
     */
    async spawnContainer(config: ContainerConfig): Promise<ContainerInfo> {
        try {
            // Ensure image exists (pull if not)
            await this.ensureImage(RunnerService.IMAGE);

            // Configure container with random host port
            const container = await docker.createContainer({
                Image: RunnerService.IMAGE,
                // Pass the folder path as the last argument to open it by default
                Cmd: ['--port', '3000', '--host', '0.0.0.0', '--without-connection-token', '/home/workspace'],
                ExposedPorts: {
                    '3000/tcp': {},
                },
                HostConfig: {
                    PortBindings: {
                        '3000/tcp': [{ HostPort: '0' }], // Docker assigns random port
                    },
                    // Mount the project directory
                    Binds: [`${config.projectPath}:/home/workspace:rw`],
                },
                // Set working directory
                WorkingDir: '/home/workspace',
            });

            await container.start();

            // Inspect container to get assigned port
            const data = await container.inspect();
            const bindings = data.NetworkSettings.Ports['3000/tcp'];

            if (!bindings || bindings.length === 0) {
                throw new Error('Failed to retrieve assigned port from Docker');
            }

            const assignedPort = parseInt(bindings[0].HostPort, 10);

            // Wait for the server to be ready
            await this.waitForPort(assignedPort);

            return {
                containerId: container.id,
                // Append query param to force VS Code to open the folder
                url: `http://localhost:${assignedPort}/?folder=/home/workspace`,
                hostPort: assignedPort,
            };

        } catch (error) {
            console.error('Failed to spawn container:', error);
            throw error;
        }
    }

    /**
     * Polls the port via HTTP until it returns a valid response.
     */
    private async waitForPort(port: number, timeoutMs = 20000): Promise<void> {
        const start = Date.now();
        const url = `http://localhost:${port}`;

        while (Date.now() - start < timeoutMs) {
            try {
                const res = await fetch(url);
                if (res.ok) {
                    return; // Server is ready
                }
            } catch (err) {
                // Ignore connection errors and retry
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        console.warn(`Timeout waiting for URL ${url} to be ready.`);
    }

    /**
     * Stops and removes a container.
     */
    async stopContainer(containerId: string): Promise<void> {
        try {
            const container = docker.getContainer(containerId);
            await container.stop();
            await container.remove();
        } catch (error) {
            console.error(`Failed to stop container ${containerId}:`, error);
            // Ignore if already stopped/removed
        }
    }

    /**
     * Pulls the image if not present.
     */
    private async ensureImage(image: string): Promise<void> {
        const images = await docker.listImages();
        const exists = images.some(img => img.RepoTags?.includes(image));

        if (!exists) {
            console.log(`Pulling image ${image}...`);
            await new Promise((resolve, reject) => {
                docker.pull(image, (err: any, stream: any) => {
                    if (err) return reject(err);
                    docker.modem.followProgress(stream, onFinished, onProgress);
                    function onFinished(err: any, output: any) {
                        if (err) return reject(err);
                        resolve(output);
                    }
                    function onProgress(event: any) {
                        // console.log(event);
                    }
                });
            });
            console.log(`Image ${image} pulled.`);
        }
    }

}
