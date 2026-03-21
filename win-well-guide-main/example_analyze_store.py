"""
Example: How to use the analyze_store function
This demonstrates how to call the store analysis when the analyze button is clicked
"""

from analyze_store import analyze_store

# Example 1: Basic usage - analyze a store
def example_basic_analysis():
    """Basic example of analyzing a store"""
    store_url = "https://example.myshopify.com"
    
    print(f"Analyzing store: {store_url}")
    result = analyze_store(store_url)
    
    if result["success"]:
        print(f"\n✅ Analysis Complete!")
        print(f"Store: {result['store_info']['title']}")
        print(f"Score: {result['analysis']['overall_score']}/100")
        print(f"\nReport Preview:")
        print(result['analysis']['audit_report'][:200] + "...")
    else:
        print(f"❌ Error: {result['error']}")


# Example 2: Using in a web application (like Flask)
def example_flask_integration():
    """Example of how this integrates with Flask API"""
    # This is already done in store_analyzer_api.py
    # When the frontend calls POST /api/analyze-store, it uses:
    # result = analyze_store(store_url, store_name)
    pass


# Example 3: Direct function call (standalone script)
def example_direct_call():
    """Call the function directly without API"""
    store_url = input("Enter store URL: ").strip()
    
    if not store_url:
        print("No URL provided")
        return
    
    print("\n🔬 Starting analysis...")
    result = analyze_store(store_url)
    
    if result["success"]:
        print("\n" + "="*70)
        print("ANALYSIS RESULTS")
        print("="*70)
        print(f"\nStore: {result['store_info']['title']}")
        print(f"URL: {result['url']}")
        print(f"Response Time: {result['store_info']['response_time_seconds']:.2f}s")
        print(f"HTTPS: {'✓' if result['store_info']['https_enabled'] else '✗'}")
        print(f"\n🎯 Overall Score: {result['analysis']['overall_score']}/100")
        print(f"\n📄 Full Audit Report:")
        print("-"*70)
        print(result['analysis']['audit_report'])
        print("-"*70)
        print(f"\nAnalyzed at: {result['analysis']['analyzed_at']}")
    else:
        print(f"\n❌ Analysis failed: {result.get('error')}")


if __name__ == "__main__":
    # Run the direct call example
    example_direct_call()





