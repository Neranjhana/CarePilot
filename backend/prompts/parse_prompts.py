import re
import json
def serialize_document(doc):
    """Convert MongoDB document to a JSON-serializable format."""
    if doc is not None:
        doc['_id'] = str(doc['_id'])  # Convert ObjectId to string
    return doc
def parse_action_plan(content):
    """Extract action items into a structured dictionary with numbered keys."""
    action_items = {}
    
    # Split the content into sections based on newline characters
    lines = content.strip().splitlines()

    current_item = ""
    item_number = 0
    
    for line in lines:
        # Check if the line starts with a number followed by a dot
        match = re.match(r'(\d+)\.\s+(.*)', line)
        if match:
            # If we have a previous item, save it
            if current_item:
                action_items[str(item_number)] = current_item.strip()
            
            # Update item number and start a new item
            item_number = int(match.group(1))
            current_item = match.group(2)
        else:
            # Append the line to the current item, flattening it
            current_item += " " + line.strip() if current_item else line.strip()

    # Don't forget to add the last item
    if current_item:
        action_items[str(item_number)] = current_item.strip()

    return action_items