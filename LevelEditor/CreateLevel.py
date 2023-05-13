import tkinter as tk
import os
import numpy as np # pip install numpy

# Define constants for the objects
WALL = "#"
SPAWN = "."
EXIT = "o"
EMPTY = "''"

width = 80
height = 40
# maybe one day without numpy so we can just run instead of needing to install a new module
canvas_state = np.empty([width, height], dtype=str)

class CanvasApp:
    def save_to_file(self):
        # Get the file name from the text entry
        filename = self.filename_entry.get()
        print("file saving...")

        # Create a list of (x, y, tile_id) tuples from the canvas state
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), filename) + ".txt", 'w', encoding='utf-8') as f:
            for y in range(height):
                for x in range(width):
                    if(canvas_state[x, y] == (WALL or SPAWN or EXIT)):
                        f.write(canvas_state[x, y]) # write state of map
                    else:
                        f.write(" ") # write a blank for nothing
                if(y != height - 1): # prevent blank last line
                    f.write("\n")
        print(f"File saved to {os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)}.txt")

    def getPos(event,self):
        # Get the x and y coordinates of the mouse cursor on the canvas
        x = self.canvas.canvasx(event.x)
        y = self.canvas.canvasy(event.y)
        
        # Calculate the row and column of the clicked cell
        row = y // 20
        col = x // 20
        
        return [col,row]
    
    def quick_walls(self):
        for y in range(height):
            for x in range(width):
                if y == 0 or y == height - 1:
                    self.canvas.create_text(x * 20 + 10, y * 20 + 10, text=self.current_object, tags=("object",))
                    canvas_state[x, y] = str(self.current_object)
                if x == 0 or x == width - 1:
                    self.canvas.create_text(x * 20 + 10, y * 20 + 10, text=self.current_object, tags=("object",))
                    canvas_state[x, y] = str(self.current_object)

    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Canvas App")

        # background stuff
        self.root.configure(bg="#C6C6C6")

        # Create the canvas
        self.canvas = tk.Canvas(self.root, width=width * 20, height=height * 20)
        self.canvas.pack()

        # Create the buttons for each object
        self.wall_button = tk.Button(self.root, text="Wall", command = lambda: self.set_object(WALL))
        self.wall_button.pack(side=tk.LEFT)

        self.spawn_button = tk.Button(self.root, text="Spawn", command = lambda: self.set_object(SPAWN))
        self.spawn_button.pack(side=tk.LEFT)

        self.exit_button = tk.Button(self.root, text="Exit", command = lambda: self.set_object(EXIT))
        self.exit_button.pack(side=tk.LEFT)

        self.quick_walls = tk.Button(self.root, text="Quick Wall", command = self.quick_walls)
        self.quick_walls.pack(side=tk.LEFT)

        # Create the text entry box for the filename
        filename_label = tk.Label(self.root, text="Filename:")
        filename_label.pack(side=tk.LEFT)
        self.filename_entry = tk.Entry(self.root)
        self.filename_entry.pack(side=tk.LEFT)

        # Create the button for saving to file
        save_button = tk.Button(self.root, text="Save to File", command=self.save_to_file)
        save_button.pack(side=tk.LEFT)

        # Set the default object to be placed
        self.current_object = WALL

        # Bind the canvas to the mouse events
        self.canvas.bind("<ButtonPress-1>", self.canvas_start_placing)
        self.canvas.bind("<B1-Motion>", self.canvas_place)
        self.canvas.bind("<ButtonPress-3>", self.canvas_start_erasing)
        self.canvas.bind("<B3-Motion>", self.canvas_erase)

        # Start the event loop
        self.root.mainloop()

    # The tile we are placing
    def set_object(self, obj):
        self.current_object = obj

    def canvas_start_placing(self, event):
        self.canvas_place(event)

    def canvas_place(self, event):
        # Calculate the row and column of the clicked cell
        row = event.y // 20
        col = event.x // 20

        # Check if there's already an object at the clicked cell
        overlapping = self.canvas.find_overlapping(col*20, row*20, col*20+20, row*20+20)
        if overlapping:
            return

        # Place the current object at the clicked cell
        self.canvas.create_text(col*20 + 10, row*20 + 10, text=self.current_object, tags=("object",))

        x, y = CanvasApp.getPos(event, self)

        if x < 0 or x >= canvas_state.shape[1] or y < 0 or y >= canvas_state.shape[0]:
            return # Return if we are out of bounds
        canvas_state[int(y), int(x)] = str(self.current_object)

    def canvas_start_erasing(self, event):
        self.canvas_erase(event)

    def canvas_erase(self, event):
        # Calculate the row and column of the clicked cell
        row = event.y // 20
        col = event.x // 20

        # Remove any object at the clicked cell
        objects = self.canvas.find_overlapping(col*20, row*20, col*20+20, row*20+20)
        for obj in objects:
            if "object" in self.canvas.gettags(obj):
                self.canvas.delete(obj)
        
        x, y = CanvasApp.getPos(event, self)

        if x < 0 or x >= canvas_state.shape[1] or y < 0 or y >= canvas_state.shape[0]:
            return # Return if we are out of bounds
        canvas_state[int(y), int(x)] = EMPTY # Make string empty so it wont be appended when saved
        #! canvas_state sometimes erases wrong part (on lower than 20), this is due to a different x,y position than we last saw?

if __name__ == "__main__":
    CanvasApp()