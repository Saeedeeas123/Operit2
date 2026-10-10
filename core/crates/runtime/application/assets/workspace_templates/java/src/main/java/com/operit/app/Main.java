package com.operit.app;

/**
 * Operit Java project
 * Uses the standard Gradle project structure
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("🚀 Welcome to your Operit Java project!");
        System.out.println("=".repeat(50));
        System.out.println("This is a standard Gradle Java project. You can:");
        System.out.println("  ✨ Write and compile Java code");
        System.out.println("  📦 Manage dependencies with Gradle");
        System.out.println("  🏗️ Build and run Java applications");
        System.out.println("  🧪 Write and run unit tests");
        System.out.println("=".repeat(50));
        
        // Example code
        Calculator calc = new Calculator();
        int result = calc.add(5, 3);
        System.out.println("\nCalculation example: 5 + 3 = " + result);
        
        // Array handling example
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = calc.sum(numbers);
        System.out.println("Array sum: " + sum + "\n");
        
        System.out.println("✅ Program ran successfully!");
    }
}
