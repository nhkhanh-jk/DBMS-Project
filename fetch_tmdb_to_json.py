import os
import requests
import json
from uuid import uuid4
from datetime import datetime, timezone
from dotenv import load_dotenv
import time

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
BASE_URL = "https://api.themoviedb.org/3"

def get_popular_movies(page=1):
    url = f"{BASE_URL}/movie/popular?api_key={TMDB_API_KEY}&language=vi-VN&page={page}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json().get('results', [])
    return []

def get_movie_details(movie_id):
    url = f"{BASE_URL}/movie/{movie_id}?api_key={TMDB_API_KEY}&language=vi-VN"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    return None

def fetch_tmdb_to_json(num_movies=500, output_file="movies_data.json"):
    if not TMDB_API_KEY:
        print("Lỗi: Chưa tìm thấy TMDB_API_KEY. Hãy kiểm tra lại file .env!")
        return

    print(f"Đang cào {num_movies} bộ phim từ The Movie Database (TMDB)...")
    
    movies_processed = 0
    current_page = 1
    final_data = []

    while movies_processed < num_movies:
        print(f"\n--- Đang tải dữ liệu Trang {current_page} ---")
        movies_list = get_popular_movies(page=current_page)
        
        if not movies_list:
            print("Đã hết dữ liệu từ TMDB hoặc có lỗi kết nối.")
            break

        for movie_stub in movies_list:
            if movies_processed >= num_movies:
                break
                
            details = get_movie_details(movie_stub['id'])
            if not details:
                continue

            movie_id = str(uuid4())
            title = details.get('title', 'Unknown Title')
            
            genres_list = [genre['name'] for genre in details.get('genres', [])]
            description = details.get('overview', '')
            duration_min = details.get('runtime') or 0
            
            release_date_str = details.get('release_date')
            if release_date_str:
                release_date = datetime.strptime(release_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            else:
                release_date = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
                
            raw_status = details.get('status', 'RELEASED').upper()
            status = 'RELEASED' if raw_status == 'RELEASED' else 'SCHEDULED'
            
            poster_path = details.get('poster_path')
            poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else ""
            
            now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

            final_data.append({
                "id": movie_id,
                "title": title,
                "genres": genres_list,
                "description": description,
                "durationMin": duration_min,
                "releaseDate": release_date,
                "status": status,
                "posterUrl": poster_url,
                "createdAt": now_str,
                "updatedAt": now_str
            })
            
            movies_processed += 1
            print(f"Đã xử lý [{movies_processed}/{num_movies}]: {title}")

        current_page += 1
        time.sleep(0.5) 

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
        
    print(f"\nĐã xuất thành công {movies_processed} bộ phim ra file '{output_file}'.")

if __name__ == "__main__":
    fetch_tmdb_to_json(num_movies=500, output_file="movies_data.json")