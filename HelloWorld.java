/*
 * HelloWorld.java
 *
 * Example file
 */

public class HelloWorld
{
	public HelloWorld() {
	}

	public static void main(String[] argv) {
		HelloWorld hw = new HelloWorld();
		hw.printHello();
		hw.printWorld();
	}

	public void printHello() {
		System.out.println("Hello");
	}

	public void printWorld() {
		System.out.println("World");
	}
}

