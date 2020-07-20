import express from "express";
import { Server } from "http";
import socketIo from "socket.io";
import { range, random } from "lodash";

interface ICar {
  name: string
  id: number
  lat: number
  lng: number
}

const port = 4000;

const app = express();
const server = new Server(app);
const io = socketIo(server);

const rawItems = range(10);

const cars: ICar[] = rawItems.map((item) => ({
  id: item,
  name: `Car ${item}`,
  lat: 54.370044 + 0.01 - random(0.2, true),
  lng: 18.600549 + 0.01 - random(0.2, true),
}));

const updateCarPositionAndEmit = () => {
  cars.map((car: ICar) => {
    if (random(1, true) < 0.3) {
      const updatedCar = {
        ...car,
        lat: car.lat + 0.01 - random(0.02, true),
        lng: car.lng + 0.01 - random(0.02, true),
      };
      io.sockets.emit("carPositionUpdated", updatedCar);
      return updatedCar;
    } else {
      return car;
    }
  });
};

setInterval(() => updateCarPositionAndEmit(), 2000);

app.get("/cars", (_, response) => {
  response.send(cars);
});

io.on("connect", (socket) => {
  console.log("🌕 Client connected, emit initial cars...");
  socket.emit("cars", cars);

  socket.on("disconnect", () => {
    console.log("🌑 Client disconnected.");
  });
});

server.listen(port, () => {
  console.log(`Server running on port http://localhost:${port} 💫`);
});
