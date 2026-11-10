
from grok_service import generate_response

try:
    result = generate_response(
        "Explain TCP three-way handshake in simple words."
    )

    print("\nSERVICE TEST SUCCESSFUL!")
    print(result)

except Exception as error:
    print("\nSERVICE TEST FAILED!")
    print(error)
