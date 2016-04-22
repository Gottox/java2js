/*
 * ProcessingDemo.java
 *
 * Example file
 */

class ProcessingDemo {
	// Global variables
	float radius = 50.0f;
	int X, Y;
	int nX, nY;
	int delay = 16;

	public ProcessingDemo(Processing processing) {
		this.processing = processing;
	}

	// Setup the Processing Canvas
	public void setup(){
	}

	// Main draw loop
	public void draw(){
		this.processing.background(224);
	}
}
