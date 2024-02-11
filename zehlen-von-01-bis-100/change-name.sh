for file in 000-*.mp3; do
  # Extract the number from the file name (assuming the format is "000-*.mp3")
  number=$(echo "$file" | sed -E 's/000-([0-9]+)\.mp3/\1/')
  
  # Increment the number by 1
  new_number=$((number + 1))
  
  # Construct the new file name (format "zahl-*+1.mp3")
  new_file_name="zahl-${new_number}.mp3"
  
  # Rename the file
  mv "$file" "$new_file_name"
  
  echo "Renamed $file to $new_file_name"
done
