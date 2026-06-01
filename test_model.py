"""
Model dogrulama scripti.
Calistirmak icin: python test_model.py
API'nin ayakta olmasi gerekmez, direkt model dosyasini okur.
"""
import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model.recommender import get_similar_movies, get_recommendations, get_dataset_stats

print("=" * 55)
print("ALIFLIX — MODEL DOGRULAMA")
print("=" * 55)

# 1. Veri seti ozeti
stats = get_dataset_stats()
print(f"\nVeri Seti:")
print(f"  Kullanici : {stats['total_users']:,}")
print(f"  Film      : {stats['total_movies']:,}")
print(f"  Rating    : {stats['total_ratings']:,}")
print(f"  Ortalama  : {stats['avg_rating']}")

# 2. Bilinen filmler icin KNN testi
test_films = [
    (318,  "Shawshank Redemption"),
    (296,  "Pulp Fiction"),
    (356,  "Forrest Gump"),
    (2571, "Matrix"),
]

print("\nKNN Benzerlik Testi (her film icin top-3 komsu):")
print("-" * 55)

for movie_id, name in test_films:
    similar = get_similar_movies(movie_id, n=3)
    if not similar:
        print(f"  {name}: MODEL'DE YOK (movieId={movie_id})")
        continue
    print(f"\n  [{movie_id}] {name}")
    for s in similar:
        print(f"    -> {s['title'][:35]:<35} dist={s['distance']:.2f}")

# 3. Filtre testi — en az 5 oneri geliyor mu?
print("\n\nFiltre Testi (odev sarti: en az 5 oneri):")
print("-" * 55)

test_cases = [
    {"genre": "Action", "min_rating": 4.0, "n": 5},
    {"genre": "Drama",  "min_rating": 4.2, "n": 5},
    {"movie_id": 318, "genre": "Crime", "n": 5},
]

for params in test_cases:
    results = get_recommendations(**params)
    status = "GECTI" if len(results) >= 5 else "KALDI"
    label  = str(params)[:50]
    print(f"  {status}  ({len(results)} oneri)  {label}")

print("\nTest tamamlandi.")


# 4. Kullanici bazli oneri testi
print("\nKullanici-bazli oneriler testi:")
from model import recommender as recmod
user_counts = recmod.ratings['userId'].value_counts()
candidate_users = user_counts[user_counts >= 20]
if not candidate_users.empty:
    sample_user = int(candidate_users.index[0])
else:
    sample_user = int(user_counts.index[0])
print(f"  Secilen Kullanici: {sample_user} (rated: {user_counts.get(sample_user, 0)})")
results = get_recommendations(user_id=sample_user, n=5)
print(f"  {len(results)} oneri bulundu")
for r in results[:5]:
    print(f"    - {r['title'][:60]:60} | {r.get('reason','')}")

print("\nTum testler tamamlandi.")
