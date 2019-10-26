# Racko AI Visualization
This project is a visualization of an A* search AI for a deterministic version of the game [Rack-O](https://howdoyouplayit.com/rack-o-rules-bonus-rack-o-rules/). The program will first fill the 10-card rack with random cards, before playing Rack-O until it wins. Because it uses an admissible and consistent heuristic, it will always show the fastest route to get an ordered rack. 

## Usage

After downloading the files required for this program, open the `index.html` file through a localhost server. If your computer has Python 3, you should be able to run `python -m SimpleHTTPServer`, open `localhost:8000` in your browser and navigate to the `index.html` file. 

If this isn't working for whatever reason, you can see the result of this program [here](https://editor.p5js.org/aknospe/present/qUQSDt3NK)!

## Heuristic

For a general search problem, the A* search algorithm chooses whichever node minimizes: 

*f(n) = g(n) + h(n)*

*where:* 

*n* is the next node on the path, *g(n)* is the cost of the path from the start node to n, and *h(n)* is a heuristic function that estimates the cost of the cheapest path from *n* to the goal. 

For this project, the following simple heuristic was used: 

*h(n) = |r| - q*

*where:* 

*r* is the rack and *q* is the length of the longest increasing subsequence of *r* (formally *max(|{x ∈ S(r) : c<sub>n</sub> < c<sub>n+1</sub> ∀ n }|)*). Essentially, the heuristic function returns the number of cards on the rack not in order. This makes understanding the heuristic's consistency quite intuitive; given perfectly optimal cards drawn, a player with perfect information (even knowing future draws) would still require at least h(n) swaps to win the game. 

