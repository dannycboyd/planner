import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-icon',
  template: `
    <svg>

    </svg>
  `
})

// not included in the index.ts yet, so it won't work if you change it here :)
export class IconComponent implements OnInit {
  constructor() { }

  ngOnInit() { }
}
