import { socketendPoint } from "./aws-config";

class SocketService {
  private socket: WebSocket | null = null;
  private static instance: SocketService;
  private readonly apiUrl: string = socketendPoint;
  private listeners: ((data: any) => void)[] = []; // Maintain multiple listeners

  private constructor() {
    this.connect();
  }

  private connect() {
    try {
      this.socket = new WebSocket(this.apiUrl);

      this.socket.onopen = () => {
        console.log('WebSocket Connected');
        this.send({ action: 'connect' });
      };

      this.socket.onclose = () => {
        console.log('WebSocket Disconnected');
        setTimeout(() => this.connect(), 3000);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket Message Received:", data);

          // Notify all listeners
          this.listeners.forEach((listener) => listener(data));

          if (data.type === 'db_update') {
            this.handleDatabaseUpdate(data);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
    } catch (error) {
      console.error('Connection Error:', error);
    }
  }

  private handleDatabaseUpdate(data: any) {
    console.log('Database Update:', data);
    // Notify all registered listeners
    this.listeners.forEach((listener) => listener(data));
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public send(data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  public disconnect() {
    this.socket?.close();
  }

  // Allow multiple listeners to subscribe
  public addListener(callback: (data: any) => void) {
    console.log("listening" );
    this.listeners.push(callback);
  }

  public removeListener(callback: (data: any) => void) {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }
}

export default SocketService;
