import os

# Path to the sounds directory
sounds_dir = 'E:/C DRIVE BACKUP/DESKTOP/CREATIVE CODING/JS EXPERIMENTS/DIG/sounds'

# Get the list of files in the directory
files = os.listdir(sounds_dir)

# Rename files to sound1.mp3, sound2.mp3, etc.
for index, file in enumerate(files):
    # Construct the new filename
    new_filename = f'sound{index + 1}.mp3'
    # Full path for the old and new filenames
    old_file = os.path.join(sounds_dir, file)
    new_file = os.path.join(sounds_dir, new_filename)
    
    # Rename the file
    os.rename(old_file, new_file)
    print(f'Renamed: {old_file} to {new_file}')