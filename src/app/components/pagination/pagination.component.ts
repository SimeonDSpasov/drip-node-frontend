import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() itemsPerPageOptions: number[] = [10, 20, 50, 100];

  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 3;
    
    // Calculate start and end page numbers
    let startPage = Math.max(2, this.currentPage - 1);
    let endPage = Math.min(this.totalPages - 1, this.currentPage + 1);
    
    // Adjust if we're near the start
    if (startPage <= 2) {
      endPage = Math.min(this.totalPages - 1, maxPagesToShow);
    }
    
    // Adjust if we're near the end
    if (endPage >= this.totalPages - 1) {
      startPage = Math.max(2, this.totalPages - maxPagesToShow);
    }
    
    // Add pages to array
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onItemsPerPageChange(): void {
    this.itemsPerPageChange.emit(this.itemsPerPage);
  }
} 